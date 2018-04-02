module.exports = function (services, models) {
  var module = {}
  module.transactionPool = {}
  module.add = function (transaction, cb) {
    return this.verify_transaction(transaction, function (err, res) {
      if (err) {
        return cb(err)
      } else {
        this.add_to_pool(transaction)
        return cb(null, this.count_pool())
      }
    })
  }
  this.verify_transaction = function (transaction, cb) {
    services.block.getBlockHeight(function (err, height) {
      if (err) {
        return cb(err)
      } else {
        services.transaction.verify_non_block_transactions([transaction], this.get_from_pool(), height, cb)
      }
    })
  }
  this.flush = function (miningReward, privateKey, publicKey, data, cb) {
    return services.block.generate_block(this.get_from_pool(), miningReward, privateKey, publicKey, data, function (err, block) {
      if (err) {
        return cb(err)
      } else {
        return services.chain.create([block], function (err, res) {
          if (err) {
            return cb(err)
          } else {
            this.empty_pool()
            cb(null)
          }
        })
      }
    })
  }
  module.empty_pool = function () {
    Object.keys(this.transactionPool).forEach((x) => {
      delete this.transactionPool[x]
    })
  }
  module.add_to_pool = function (transaction) {
    var hash = services.transaction.calculate_hash()
    this.transactionPool[hash] = transaction
  }
  module.get_from_pool = function () {
    return Object.keys(this.transactionPool).map((k) => this.transactionPool[k])
  }
  module.count_pool = function () {
    return Object.keys(this.transactionPool).length
  }
  return module
}
