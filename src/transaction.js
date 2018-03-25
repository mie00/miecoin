var exceptions = require('./exceptions')
var utils = require('./utils')

module.exports = function (services, models) {
  var module = {}
  module.add_transactions = function (transactions) {
    return utils.flatMap(transactions, (transaction) => this.add(transaction))
  }
  module.add = function (transaction) {
    return [models.add_transaction(transaction)].concat(this.add_components(transaction.components))
  }
  module.add_components = function (components) {
    return components.map((component) => this.add_component(component))
  }
  module.add_component = function (component) {
    if (component.type === 'itx') {
      return this.add_itx(component)
    } else if (component.type === 'otx') {
      return this.add_otx(component)
    } else if (component.type === 'raw_data') {
      return this.add_raw_data(component)
    }
  }
  module.add_itx = function (itx) {
    return models.add_itx(itx)
  }
  module.add_otx = function (otx) {
    return models.add_otx(otx)
  }
  module.add_raw_data = function (raw_data) {
    return models.add_raw_data(raw_data)
  }
  module.verify_merkle = function (block, miningReward, cb) {
    var nonBlockTransactions = block.transactions.filter((transaction) => !transaction.block_transaction)
    this.verify_non_block_transactions(nonBlockTransactions, function (err, change) {
      if (err) {
        return cb(err)
      }
      var blockTransactions = block.transactions.filter((transaction) => transaction.block_transaction)
      this.verify_block_transactions(blockTransactions, change, miningReward, function (err) {
        if (err) {
          return cb(err)
        }
        var hashes = block.transactions.map((transaction) => this.calculate_hash(transaction))
        var merkleRoot = utils.calculate_merkle(hashes)
        if (merkleRoot !== block.merkle_root) {
          return cb(new exceptions.InvalidMerklerRootException())
        }
      })
    })
  }
  module.verify_non_block_transactions = function (nonBlockTransactions, cb) {
    var self = this
    var blockChange = 0
    var usedtxo = {}
    var onFinish = function (err, res) {
      if (err) {
        return cb(err)
      } else {
        blockChange += res.change
        for (var e of res.sources) {
          if (usedtxo[e]) {
            return cb(new exceptions.DoubleSpendingException())
          } else {
            usedtxo[e] = true
          }
        }
        return cb(err, blockChange)
      }
    }
    for (var transaction of nonBlockTransactions) {
      onFinish = (function (t, v) {
        return function (err, res) {
          if (err) {
            return v(err)
          } else {
            blockChange += res.change
            for (var e of res.sources) {
              if (usedtxo[e]) {
                return v(new exceptions.DoubleSpendingException())
              } else {
                usedtxo[e] = true
              }
            }
            return self.verify(t, v)
          }
        }
      })(transaction, onFinish)
    }
    try {
      onFinish(null, {'change': 0, 'sources': []})
    } catch (e) {
      cb(e)
    }
  }
  module.verify_block_transactions = function (blockTransactions, blockChange, miningReward, cb) {
    var spent = utils.sum(utils.flatMap(blockTransactions, (transaction) => transaction.components)
      .filter((component) => component.type === 'otx')
      .map((component) => component.amount))
    if (!(spent <= blockChange + miningReward)) {
      return cb(new exceptions.OverSpendingException())
    } else {
      return cb(null)
    }
  }
  module.verify = function (transaction, cb) {
    var self = this
    var itx = transaction.components.filter((component) => component.type === 'itx')
    var otx = transaction.components.filter((component) => component.type === 'otx')
    self.verify_in_out(itx, otx, function (err) {
      if (err) {
        return cb(err)
      }
      return self.get_sources(itx, function (err, itxSources) {
        if (err) {
          return cb(err)
        }
        return self.verify_signatures(itxSources, function (err) {
          if (err) {
            return cb(err)
          }
          self.verify_amount(otx, itxSources, function (err, change) {
            if (err) {
              return cb(err)
            } else {
              return cb(null, {'change': change, 'sources': itxSources.map((x) => x.otx.hash)})
            }
          })
        })
      })
    })
  }
  module.verify_in_out = function (itx, otx, cb) {
    var otxHash = utils.hash(this.components_to_buffer(otx))
    var nonMatchingItx = itx.filter((i) => i.to_hash !== otxHash)
    if (nonMatchingItx.length) {
      cb(new exceptions.NonMatchingInOutException())
    } else {
      cb(null)
    }
  }
  module.verify_signatures = function (itxSources, cb) {
    var invalidSignatures = itxSources.map((itxSource) => {
      var buffer = this.itx_to_buffer(itxSource)
      return utils.verify(buffer, itxSource.otx.public_key, itxSource.signature)
    }).filter((valid) => !valid)
    if (invalidSignatures.length) {
      return cb(new exceptions.InvalidTransactionSignatureException())
    } else {
      return cb(null)
    }
  }
  module.verify_amount = function (otx, itxSources, cb) {
    var spent = utils.sum(otx.map((o) => o.amount))
    var available = utils.sum(itxSources.map((i) => i.otx.amount))
    if (spent > available) {
      return cb(new exceptions.UnavailableAmountException())
    } else return cb(null, available - spent)
  }
  module.get_sources = function (itx, cb) {
    var sources = itx.map((i) => i.source)
    return models.selectUTXO(sources,
      function (err, results) {
        if (err) {
          return cb(err)
        } else {
          var sources = utils.groupBy(results, 'hash')
          for (var i of itx) {
            i.otx = sources[i.source]
          }
          return cb(null, itx)
        }
      })
  }
  module.calculate_hash = function (transaction) {
    return utils.hash(this.to_buffer(transaction))
  }
  module.to_buffer = function (transaction) {
    return this.components_to_buffer(transaction.components)
  }
  module.components_to_buffer = function (components) {
    return Buffer.concat(components.map((component) => this.component_to_buffer(component)))
  }
  module.component_to_buffer = function (component) {
    if (component.type === 'itx') {
      return this.itx_to_buffer(component)
    } else if (component.type === 'otx') {
      return this.otx_to_buffer(component)
    } else if (component.type === 'raw_data') {
      return this.raw_data_to_buffer(component)
    } else {
      throw new exceptions.UnknownComponentTypeException()
    }
  }
  module.itx_to_buffer = function (itx) {
    var buffer = Buffer.alloc(16 + 256 + 1024)
    var cursor = 0
    utils.fill(buffer, itx.type, cursor, 16)
    cursor += 16
    utils.fill(buffer, itx.source, cursor, 256)
    cursor += 256
    utils.fill(buffer, itx.to_hash, cursor, 256)
    cursor += 1024
    return buffer
  }
  module.otx_to_buffer = function (otx) {
    var buffer = Buffer.alloc(16 + 256 + 1024)
    var cursor = 0
    utils.fill(buffer, otx.type, cursor, 16)
    cursor += 16
    buffer.writeInt32BE(otx.amount, cursor)
    cursor += 256
    utils.fill(buffer, otx.public_key, cursor, 1024)
    cursor += 1024
    return buffer
  }
  module.raw_data_to_buffer = function (rawData) {
    var buffer = Buffer.alloc(16 + 256 + 1024)
    var cursor = 0
    utils.fill(buffer, rawData.type, cursor, 16)
    cursor += 16
    cursor += 256
    utils.fill(buffer, rawData.data, cursor, 1024)
    cursor += 1024
    return buffer
  }
  return module
}
