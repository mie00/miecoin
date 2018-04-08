var exceptions = require('./exceptions')
var utils = require('./utils')

module.exports = function (services, models) {
  var module = {}
  module.add = function (block) {
    var queries = [models.add_block(utils.gather(block,
      ['height', 'parent_hash', 'hash', 'public_key',
        'signature', 'merkle_root', 'created_at', 'received_at']))]
    queries = queries.concat(services.transaction.add_transactions(block.transactions, block.hash))
    return queries
  }
  module.sign = function (block, privateKey) {
    var buffer = this.to_buffer(block)
    return utils.sign(buffer, privateKey)
  }
  module.getBlockHeight = function (cb) {
    models.getChainHeight(cb)
  }
  module.getLastBlock = function (cb) {
    models.getLastBlock(cb)
  }
  module.getGenesisBlock = function (cb) {
    models.getGenesisBlock(cb)
  }
  module.getAuthorizedKeys = function (cb) {
    models.getFirstRawData(function (err, res) {
      if (err) {
        return cb(err)
      } else {
        return cb(null, JSON.parse(res.data).authors)
      }
    })
  }
  module.generate_block = function (transactions, miningReward, privateKey, publicKey, data, createdAt, cb) {
    var self = this
    self.getLastBlock(function (err, oldBlock) {
      if (err) {
        return cb(err)
      } else {
        if (!oldBlock) {
          oldBlock = {
            height: 0
          }
        }
        return services.transaction.generate_block_transaction(transactions, oldBlock.height + 1, miningReward, publicKey, data, createdAt, function (err, blockTransaction) {
          if (err) {
            return cb(err)
          } else {
            transactions.push(blockTransaction)
            var merkleRoot = services.transaction.calculate_merkle_root(transactions)
            var block = {
              'height': oldBlock.height + 1,
              'parent_hash': oldBlock.hash,
              'merkle_root': merkleRoot,
              'created_at': createdAt,
              'received_at': createdAt,
              'transactions': transactions
            }
            if (publicKey && privateKey) {
              block.public_key = publicKey
              var signature = utils.sign(self.to_buffer(block), privateKey)
              block.signature = signature
            } else {
              block.public_key = ''
              block.signature = ''
            }
            block.hash = self.calculate_hash(block)
            return cb(null, block)
          }
        })
      }
    })
  }
  module.verify = function (block, authors, miningReward, parentBlocks, parentTransactions, cb) {
    if (!this.verify_authority(block, authors)) {
      return cb(new exceptions.UnauthorizedException())
    }
    if (!this.verify_signature(block)) {
      return cb(new exceptions.InvalidSignatureException())
    }
    return this.verify_chain(block, parentBlocks, (err) => {
      if (err) {
        return cb(err)
      }
      return this.verify_transactions(block, miningReward, parentTransactions, (err) => {
        if (err) {
          return cb(err)
        }
        return cb(null)
      })
    })
  }
  module.calculate_hash = function (block) {
    return utils.hash(this.to_buffer(block))
  }
  module.to_buffer = function (block) {
    var buffer = Buffer.alloc(6 + 256 + 1024 + 256 + 6)
    var cursor = 0
    buffer.writeIntBE(block.height, cursor, 6)
    cursor += 6
    if (block.parent_hash) {
      // Not the genesis block
      utils.fill(buffer, block.parent_hash, cursor, 256)
    }
    cursor += 256
    utils.fill(buffer, block.public_key, cursor, 1024)
    cursor += 1024
    utils.fill(buffer, block.merkle_root, cursor, 256)
    cursor += 256
    buffer.writeIntBE(block.created_at, cursor, 6)
    cursor += 6
    return buffer
  }
  module.verify_signature = function (block) {
    var buffer = this.to_buffer(block)
    return utils.verify(buffer, block.public_key, block.signature)
  }
  module.verify_authority = function (block, authors) {
    if (authors.indexOf(block.public_key) !== -1) {
      return true
    } else {
      return false
    }
  }
  module.verify_chain = function (block, parentBlocks, cb) {
    var checkChain = function (err, results) {
      if (err) return cb(err)
      var parent = results.filter((x) => x.height === block.height - 1 && x.hash === block.parent_hash)[0]
      if (!parent) {
        return cb(new exceptions.UnknownParentException())
      }
      var duplicate = results.filter((x) => x.height === block.height && x.hash === block.hash)[0]
      if (duplicate) {
        return cb(new exceptions.DuplicateBlockException(block.height, block.hash))
      }
      var sameHeight = results.filter((x) => x.height === block.height)[0]
      if (sameHeight) {
        return cb(new exceptions.SameHeightException(block.height))
      }
      return cb(null)
    }
    if (parentBlocks[block.height - 1]) {
      return checkChain(null, [parentBlocks[block.height - 1]])
    } else {
      return models.selectBlocksByHeight([block.height, block.height - 1], checkChain)
    }
  }
  module.verify_transactions = function (block, miningReward, parentTransactions, cb) {
    services.transaction.verify_merkle(block, miningReward, parentTransactions, cb)
  }
  return module
}
