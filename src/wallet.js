var exceptions = require('./exceptions')
var utils = require('./utils')

module.exports = function (services, models, privateKey, publicKey) {
  var module = {}
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
        res.append(u)
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
        return err
      }
      var itx = utxo.map((o) => {
        return {'source': o.hash, 'private_key': privateKey}
      })
      services.transaction.generate_non_block_transaction(data, otx, itx, blockHeight, function (err, transaction) {
        if (err) {
          return cb(err)
        }
        return cb(null, transaction)
      })
    })
  }
  return module
}
