var exceptions = require('./exceptions')
var utils = require('./utils')

module.exports = function (services, models, privateKey, publicKey) {
  var module = {}
  module.areYou = function (pu, challenge, cb) {
    if (pu.indexOf(publicKey) !== -1) {
      return cb(null, {'response': utils.sign(challenge, privateKey), 'public_key': publicKey})
    } else {
      return cb(null, null)
    }
  }
  module.get_unspent_money = function (cb) {
    return models.selectUTXOByPublicKey(publicKey, cb)
  }
  module.getTotal = function (cb) {
    return this.get_unspent_money(function (err, unspent) {
      if (err) {
        return cb(err)
      }
      return cb(null, utils.sum(unspent.map((u) => u.amount)))
    })
  }
  module.get_utxo = function (amount, cb) {
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
  module.pay = function (data, otx, fee, blockHeight, cb) {
    var amount = utils.sum(otx.map((o) => o.amount))
    this.get_utxo(amount + fee, function (err, utxo) {
      if (err) {
        return cb(err)
      }
      var total = utils.sum(utxo.map((o) => o.amount))
      var change = total - amount - fee
      var changeOtx = []
      if (change) {
        changeOtx.push({'amount': change, 'public_key': publicKey})
      }
      var itx = utxo.map((o) => {
        return {'source': o.hash, 'private_key': privateKey}
      })
      services.transaction.generate_non_block_transaction(data, otx.concat(changeOtx), itx, blockHeight, function (err, transaction) {
        if (err) {
          return cb(err)
        }
        return cb(null, transaction)
      })
    })
  }
  return module
}
