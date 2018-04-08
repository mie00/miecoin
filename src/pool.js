module.exports =
  class Pool {
    constructor (services, models) {
      this.services = services
      this.models = models
      this.transactions = {}
      this.privateKey = null
      this.publicKey = null
      this.miningReward = null
    }
    setKeyPair (privateKey, publicKey) {
      this.privateKey = privateKey
      this.publicKey = publicKey
    }
    setMiningReward (miningReward) {
      this.miningReward = miningReward
    }
    add (transaction, cb) {
      return this.verifyTransaction(transaction, (err, res) => {
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
    shouldFlush (cb) {
      if (_.keys(this.transactions).length >= 10) {
        return cb(null, true)
      } else {
        return cb(null, false)
      }
    }
    flush (data, cb) {
      var self = this
      var createdAt = new Date().getTime()
      return self.services.block.generate_new_block(self.getFromPool(), this.miningReward, this.privateKey, this.publicKey, data, createdAt, function (err, block) {
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
      var hash = this.services.transaction.calculate_hash(transaction)
      this.transactions[hash] = transaction
    }
    getFromPool () {
      return Object.keys(this.transactions).map((k) => this.transactions[k])
    }
    countPool () {
      return Object.keys(this.transactions).length
    }
}
