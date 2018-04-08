var exceptions = require('./exceptions')
var utils = require('./utils')

var _ = require('lodash')

module.exports = function (services, models) {
  var module = {}
  module.add_transactions = function (transactions, blockHash) {
    return utils.flatMap(transactions, (transaction) => this.add(transaction, blockHash))
  }
  module.add = function (transaction, blockHash) {
    return [models.add_transaction(_.merge({}, transaction, {
        'block_hash': blockHash
      }))]
      .concat(this.add_components(transaction.components, transaction.hash))
  }
  module.add_components = function (components, transactionHash) {
    return components.map((component) => this.add_component(component, transactionHash))
  }
  module.add_component = function (component, transactionHash) {
    if (component.type === 'itx') {
      return this.add_itx(component, transactionHash)
    } else if (component.type === 'otx') {
      return this.add_otx(component, transactionHash)
    } else if (component.type === 'raw_data') {
      return this.add_raw_data(component, transactionHash)
    }
  }
  module.add_itx = function (itx, transactionHash) {
    return models.add_itx(_.merge({}, itx, {
      'tx_hash': transactionHash
    }))
  }
  module.add_otx = function (otx, transactionHash) {
    return models.add_otx(_.merge({}, otx, {
      'tx_hash': transactionHash
    }))
  }
  module.add_raw_data = function (rawData, transactionHash) {
    return models.add_raw_data(_.merge({}, rawData, {
      'tx_hash': transactionHash
    }))
  }
  module.getTransactionByHash = function (hash, cb) {
    models.getTransactionByHash(hash, cb)
  }
  module.calculate_merkle_root = function (transactions) {
    var hashes = transactions.map((transaction) => this.calculate_hash(transaction))
      .map((hash) => Buffer.from(hash, 'hex')).sort()
    var merkleRoot = utils.calculate_merkle(hashes)
    return merkleRoot.toString('hex')
  }
  module.generate_block_transaction = function (nonBlockTransactions, miningReward, publicKey, data, createdAt, cb) {
    var self = this
    return models.getChainHeight((err, blockHeight) => {
      if (err) {
        return cb(err)
      }
      return self.verify_non_block_transactions(nonBlockTransactions, [], blockHeight, function (err, res) {
        if (err) {
          return cb(err)
        } else {
          var spare = res.change + miningReward
          var rawData = data.map((d) => self.generate_raw_data(d.data, d.created_at))
          var components = rawData
          if (spare) {
            var otx = self.generate_otx(spare, publicKey, createdAt)
            components.push(otx)
          }
          var blockTransaction = {
            'block_transaction': true,
            'components': components
          }
          blockTransaction.hash = self.calculate_hash(blockTransaction)
          return cb(null, blockTransaction)
        }
      })
    })
  }
  module.generate_non_block_transaction = function (data, otx, itx, cb) {
    var self = this
    var transaction = self.create_non_block_transaction(data, otx, itx)
    return models.getChainHeight((err, blockHeight) => {
      if (err) {
        return cb(err)
      }
      return self.verify_non_block_transactions([transaction], [], blockHeight, function (err, res) {
        if (err) {
          return cb(err)
        } else {
          return cb(null, transaction)
        }
      })
    })
  }
  module.create_non_block_transaction = function (data, otx, itx) {
    var nonItx = data.map((d) => this.generate_raw_data(d.data, d.created_at)).concat(otx.map((o) => this.generate_otx(o.amount, o.public_key, o.created_at)))
    var otxHash = utils.hash(this.components_to_buffer(nonItx))
    var transaction = {
      'block_transaction': false,
      'components': nonItx.concat(itx.map((i) => this.generate_itx(i.source, i.private_key, otxHash, i.created_at)))
    }
    transaction.hash = this.calculate_hash(transaction)
    return transaction
  }
  module.generate_raw_data = function (data, createdAt) {
    var rawData = {
      'type': 'raw_data',
      'data': data,
      'created_at': createdAt
    }
    rawData.hash = this.calculate_component_hash(rawData)
    return rawData
  }
  module.generate_otx = function (amount, publicKey, createdAt) {
    var otx = {
      'type': 'otx',
      'amount': amount,
      'public_key': publicKey,
      'created_at': createdAt
    }
    otx.hash = this.calculate_component_hash(otx)
    return otx
  }
  module.generate_itx = function (source, privateKey, toHash, createdAt) {
    var itx = {
      'type': 'itx',
      'source': source,
      'to_hash': toHash,
      'created_at': createdAt
    }
    var buffer = this.plain_itx_to_buffer(itx)
    var signature = utils.sign(buffer, privateKey)
    itx.signature = signature
    itx.hash = this.calculate_component_hash(itx)
    return itx
  }
  module.verify_merkle = function (block, miningReward, parentTransactions, cb) {
    var self = this
    var nonBlockTransactions = block.transactions.filter((transaction) => !transaction.block_transaction)
    self.verify_non_block_transactions(nonBlockTransactions, parentTransactions, block.height, function (err, res) {
      if (err) {
        return cb(err)
      }
      var blockTransactions = block.transactions.filter((transaction) => transaction.block_transaction)
      self.verify_block_transactions(blockTransactions, parentTransactions, block.height, res.change, miningReward, function (err) {
        if (err) {
          return cb(err)
        }
        var merkleRoot = self.calculate_merkle_root(block.transactions)
        if (merkleRoot !== block.merkle_root) {
          return cb(new exceptions.InvalidMerklerRootException())
        }
        return cb(null)
      })
    })
  }
  module.verify_non_block_transactions = function (nonBlockTransactions, parentTransactions, blockHeight, cb) {
    return this.verify_transactions(nonBlockTransactions, parentTransactions, blockHeight, true, cb)
  }
  module.verify_transactions = function (nonBlockTransactions, parentTransactions, blockHeight, failExtra, cb) {
    var self = this
    if (!this.verify_double_spending(nonBlockTransactions, parentTransactions)) {
      return cb(new exceptions.DoubleSpendingException())
    }
    var functions = nonBlockTransactions.map((transaction) => self.verify.bind(self, transaction, parentTransactions, blockHeight, failExtra))
    try {
      utils.serialReduce(functions, {
        change: 0,
        sources: {}
      }, (a, b) => {
        a.change += b.change
        return a
      }, cb)
    } catch (e) {
      cb(e)
    }
  }
  module.verify_double_spending = function (transactions, parentTransactions) {
    var sources = _.flatMap(transactions.concat(parentTransactions), (tx) => tx.components)
      .map((x) => x.source)
      .filter((x) => x)
    var uniq = _.uniq(sources)
    if (uniq.length < sources.length) {
      return false
    } else {
      return true
    }
  }
  module.verify_block_transactions = function (blockTransactions, parentTransactions, blockHeight, blockChange, miningReward, cb) {
    var components = utils.flatMap(blockTransactions, (transaction) => transaction.components)
    var amounts = components
      .filter((component) => component.type === 'otx')
      .map((component) => component.amount)
    var spent = utils.sum(amounts)
    if (!(spent <= blockChange + miningReward)) {
      return cb(new exceptions.OverSpendingException())
    } else {
      return this.verify_transactions(blockTransactions, parentTransactions, blockHeight, false, cb)
    }
  }
  module.verify = function (transaction, parentTransactions, blockHeight, failExtra, cb) {
    var self = this
    var itx = transaction.components.filter((component) => component.type === 'itx')
    var nonItx = transaction.components.filter((component) => component.type !== 'itx')
    var otx = transaction.components.filter((component) => component.type === 'otx')
    var toHash = self.get_to_hash(nonItx)
    return self.get_sources(itx, parentTransactions, blockHeight, function (err, itxSources) {
      if (err) {
        return cb(err)
      }
      return self.verify_signatures(itxSources, toHash, function (err) {
        if (err) {
          return cb(err)
        }
        self.verify_amount(otx, itxSources, failExtra, function (err, change) {
          if (err) {
            return cb(err)
          } else {
            return cb(null, {
              'change': change
            })
          }
        })
      })
    })
  }
  module.get_to_hash = function (nonItx) {
    var otxHash = utils.hash(this.components_to_buffer(nonItx))
    return otxHash
  }
  module.verify_signatures = function (itxSources, toHash, cb) {
    var invalidSignatures = itxSources.map((itxSource) => {
      var buffer = this.plain_itx_to_buffer(_.assign({}, itxSource, {
        'to_hash': toHash
      }))
      var valid = utils.verify(buffer, itxSource.otx.public_key, itxSource.signature)
      return valid
    }).filter((valid) => !valid)
    if (invalidSignatures.length) {
      return cb(new exceptions.InvalidTransactionSignatureException())
    } else {
      return cb(null)
    }
  }
  module.verify_amount = function (otx, itxSources, failExtra, cb) {
    var spent = utils.sum(otx.map((o) => o.amount))
    var available = utils.sum(itxSources.map((i) => i.otx.amount))
    if (failExtra && spent > available) {
      return cb(new exceptions.UnavailableAmountException())
    } else return cb(null, available - spent)
  }
  module.get_sources = function (itx, parentTransactions, blockHeight, cb) {
    var sources = itx.map((i) => i.source)
    var parentSources = utils.mapBy(_.flatMap(parentTransactions, (t) => t.components)
      .filter((c) => c.type === 'otx'), 'hash')
    if (sources.length) {
      return models.selectUTXO(sources, blockHeight,
        function (err, results) {
          if (err) {
            return cb(err)
          } else {
            var sources = utils.mapBy(results, 'hash')
            for (var i of itx) {
              if (sources[i.source]) {
                i.otx = sources[i.source]
              } else if (parentSources[i.source]) {
                i.otx = parentSources[i.source]
              } else {
                return cb(new exceptions.NotFoundSourceException())
              }
            }
            return cb(null, itx)
          }
        })
    } else {
      return cb(null, itx)
    }
  }
  module.calculate_hash = function (transaction) {
    return utils.hash(this.to_buffer(transaction))
  }
  module.to_buffer = function (transaction) {
    var buffer = Buffer.alloc(8).fill(transaction.block_transaction ? 1 : 0)
    return Buffer.concat([buffer, this.components_to_buffer(transaction.components)])
  }
  module.calculate_component_hash = function (component) {
    return utils.hash(this.component_to_buffer(component))
  }
  module.components_to_buffer = function (components) {
    return Buffer.concat(components.map((component) => this.component_to_buffer(component)).sort())
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
  module.plain_itx_to_buffer = function (itx) {
    var buffer = Buffer.alloc(16 + 256 + 1024 + 6)
    var cursor = 0
    utils.fill(buffer, itx.type, cursor, 16)
    cursor += 16
    utils.fill(buffer, itx.source, cursor, 256)
    cursor += 256
    utils.fill(buffer, itx.to_hash, cursor, 256)
    cursor += 1024
    buffer.writeIntBE(itx.created_at, cursor, 6)
    cursor += 6
    return buffer
  }
  module.itx_to_buffer = function (itx) {
    var buffer = Buffer.alloc(16 + 256 + 1024 + 6)
    var cursor = 0
    utils.fill(buffer, itx.type, cursor, 16)
    cursor += 16
    utils.fill(buffer, itx.source, cursor, 256)
    cursor += 256
    utils.fill(buffer, itx.signature, cursor, 256)
    cursor += 1024
    buffer.writeIntBE(itx.created_at, cursor, 6)
    cursor += 6
    return buffer
  }
  module.otx_to_buffer = function (otx) {
    var buffer = Buffer.alloc(16 + 256 + 1024 + 6)
    var cursor = 0
    utils.fill(buffer, otx.type, cursor, 16)
    cursor += 16
    buffer.writeIntBE(otx.amount, cursor, 6)
    cursor += 256
    utils.fill(buffer, otx.public_key, cursor, 1024)
    cursor += 1024
    buffer.writeIntBE(otx.created_at, cursor, 6)
    cursor += 6
    return buffer
  }
  module.raw_data_to_buffer = function (rawData) {
    var buffer = Buffer.alloc(16 + 256 + 1024 + 6)
    var cursor = 0
    utils.fill(buffer, rawData.type, cursor, 16)
    cursor += 16
    cursor += 256
    utils.fill(buffer, rawData.data, cursor, 1024)
    cursor += 1024
    buffer.writeIntBE(rawData.created_at, cursor, 6)
    cursor += 6
    return buffer
  }
  return module
}