var utils = require('./utils')
var exceptions = require('./exceptions')
var _ = require('lodash')

class Chain {

  constructor(services, models) {
    this.services = services
    this.models = models
    this.miningReward = null
  }
  setMiningReward(miningReward) {
    this.miningReward = miningReward
  }
  add(unsortedBlocks) {
    var blocks = unsortedBlocks.sort((x, y) => x.height - y.height)
    var queries = [this.models.removeFrom(Math.min.apply(Math, blocks.map((block) => block.height)))]
    return queries.concat(utils.flatMap(blocks, (block) => this.services.block.add(block)))
  }
  create(blocks, cb) {
    var queries = this.add(blocks)
    this.models.transaction(queries, (err, res) => {
      if (err) {
        return cb(err)
      }
      this.services.recurring.refresh()
      return cb(null, res)
    })
  }
  verify(allBlocks, authors, cb) {
    var blocks = allBlocks
      .filter((block) => block.height > 1)
      .sort((a, b) => a.height - b.height)

    var maxBlock = _.max(blocks.map((x) => x.height))

    var blockMap = utils.mapBy(blocks, 'height')
    var lastOld = 1

    return this.models.getLastBlock((err, last) => {
      if (err) {
        return cb(err)
      }
      if (last.height > maxBlock.height) {
        return cb(new exceptions.LongerChainException(last.height, maxBlock.height))
      }
      var parentTransactions = []
      return utils.serial(blocks
        .map((block) => (callback) => {
          this.services.block.verify(block, authors, this.miningReward, blockMap, parentTransactions, (err) => {
            parentTransactions = parentTransactions.concat(block.transactions)
            if (err instanceof exceptions.SameHeightException && err.height < maxBlock) {
              return callback()
            } else if (err instanceof exceptions.DuplicateBlockException && err.height < maxBlock) {
              lastOld = Math.min(lastOld, err.height)
              return callback()
            } else {
              return callback(err)
            }
          })
        }), (err) => {
          if (err) {
            return cb(err)
          }
          return cb(null, lastOld + 1)
        })
    })
  }
  getBlocks(from, limit, cb) {
    limit = limit || 1
    return this.models.getWholeBlocks(from, limit, cb)
  }
  generateGenesisBlock(authors, createdAt, cb) {
    var data = [{
      'data': JSON.stringify({
        'authors': authors
      }),
      'created_at': createdAt
    }]
    var oldBlock = {
      'height': 0
    }
    return this.services.block.generate_block(oldBlock, [], 0, '', '', data, createdAt, cb)
  }
  initGenesisBlock(authors, createdAt, cb) {
    return this.services.block.getGenesisBlock((err, res) => {
      if (err) {
        return cb(err)
      }
      return this.services.chain.generateGenesisBlock(authors, createdAt, (err, block) => {
        if (err) {
          return cb(err)
        }
        if (!res) {
          return this.create([block], (err) => {
            if (err) {
              return cb(err)
            } else {
              return cb(null, block)
            }
          })
        } else if (res.hash === block.hash) {
          return cb(new exceptions.GenesisBlockExistsException(`Genesis block exists with the same hash ${block.hash}`))
        } else {
          return cb(new exceptions.ChainNotEmptyException(`Genesis block exists with differnet hash config:chain ${JSON.stringify(block)}:${JSON.stringify(res)}`))
        }
      })
    })
  }
}

module.exports = Chain