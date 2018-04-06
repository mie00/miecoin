var exceptions = require('./exceptions')
var utils = require('./utils')

class Wallet {
  constructor (services, models) {
    this.services = services
    this.models = models
    this.privateKey = null
    this.publicKey = null
  }
  setKeyPair (privateKey, publicKey) {
    this.privateKey = privateKey
    this.publicKey = publicKey
  }
  areYou (pu, challenge, cb) {
    if (pu.indexOf(this.publicKey) !== -1) {
      return cb(null, {'response': utils.sign(challenge, this.privateKey), 'public_key': this.publicKey})
    } else {
      return cb(null, null)
    }
  }
  challenge (challenge, cb) {
    return cb(null, {'response': utils.sign(challenge, this.privateKey), 'public_key': this.publicKey})
  }
  get_unspent_money (cb) {
    return this.models.selectUTXOByPublicKey(this.publicKey, cb)
  }
  getTotal (cb) {
    return this.get_unspent_money(function (err, unspent) {
      if (err) {
        return cb(err)
      }
      return cb(null, utils.sum(unspent.map((u) => u.amount)))
    })
  }
  get_utxo (amount, cb) {
    return this.get_unspent_money(function (err, unspent) {
      if (err) {
        return cb(err)
      }
      unspent.sort((a, b) => a.amount < b.amount)
      var res = []
      var total = 0
      for (var u of unspent) {
        if (total >= amount) {
          break
        }
        res.push(u)
        total += u.amount
      }
      if (total < amount) {
        return cb(new exceptions.NotEnoughMoneyToSpendException())
      } else if (total >= amount) {
        return cb(null, res)
      }
    })
  }
  pay (data, otx, fee, blockHeight, cb) {
    var self = this
    var amount = utils.sum(otx.map((o) => o.amount))
    this.get_utxo(amount + fee, function (err, utxo) {
      if (err) {
        return cb(err)
      }
      var total = utils.sum(utxo.map((o) => o.amount))
      var change = total - amount - fee
      var changeOtx = []
      if (change) {
        changeOtx.push({'amount': change, 'public_key': self.publicKey})
      }
      var itx = utxo.map((o) => {
        return {'source': o.hash, 'private_key': self.privateKey}
      })
      self.services.transaction.generate_non_block_transaction(data, otx.concat(changeOtx), itx, blockHeight, function (err, transaction) {
        if (err) {
          return cb(err)
        }
        return cb(null, transaction)
      })
    })
  }
}

module.exports = Wallet
