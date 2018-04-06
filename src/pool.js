module.exports =
  class Pool {
    constructor (services, models) {
      this.services = services
      this.models = models
      this.transactions = {}
    }
    add (transaction, cb) {
      return this.verifyTransaction(transaction, function (err, res) {
        if (err) {
          return cb(err)
        } else {
          this.addToPool(transaction)
          return cb(null, this.countPool())
        }
      })
    }
    verifyTransaction (transaction, cb) {
      var self = this
      self.services.block.getBlockHeight(function (err, height) {
        if (err) {
          return cb(err)
        } else {
          self.services.transaction.verify_non_block_transactions([transaction], self.getFromPool(), height, cb)
        }
      })
    }
    flush (miningReward, privateKey, publicKey, data, cb) {
      var self = this
      var createdAt = new Date().getTime()
      return self.services.block.generate_block(self.getFromPool(), miningReward, privateKey, publicKey, data, createdAt, function (err, block) {
        if (err) {
          return cb(err)
        } else {
          return self.services.chain.create([block], function (err, res) {
            if (err) {
              return cb(err)
            } else {
              self.emptyPool()
              cb(null, block)
            }
          })
        }
      })
    }
    emptyPool () {
      Object.keys(this.transactions).forEach((x) => {
        delete this.transactions[x]
      })
    }
    addToPool (transaction) {
      var hash = this.services.transaction.calculate_hash()
      this.transactions[hash] = transaction
    }
    getFromPool () {
      return Object.keys(this.transactions).map((k) => this.transactions[k])
    }
    countPool () {
      return Object.keys(this.transactions).length
    }
}
