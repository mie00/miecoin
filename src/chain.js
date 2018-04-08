var utils = require('./utils')
var exceptions = require('./exceptions')
var _ = require('lodash')

module.exports = function (services, models) {
  var module = {}
  module.add = function (unsortedBlocks) {
    var blocks = unsortedBlocks.sort((x, y) => x.height - y.height)
    var queries = [models.removeFrom(Math.min.apply(Math, blocks.map((block) => block.height)))]
    return queries.concat(utils.flatMap(blocks, (block) => services.block.add(block)))
  }
  module.create = function (blocks, cb) {
    var queries = module.add(blocks)
    models.transaction(queries, cb)
  }
  module.verify = function (allBlocks, authors, miningReward, cb) {
    var blocks = allBlocks
      .filter((block) => block.height > 1)
      .sort((a, b) => a.height - b.height)

    var maxBlock = _.max(blocks.map((x) => x.height))

    var blockMap = utils.mapBy(blocks, 'height')
    var lastOld = 1

    return utils.serial(blocks
      .map((block) => (callback) => {
        services.block.verify(block, authors, miningReward, blockMap, {}, (err) => {
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
  }
  module.getBlocks = function (from, limit, cb) {
    limit = limit || 1
    return models.getWholeBlocks(from, limit, cb)
  }
  module.createGenesisBlock = function (authors, createdAt, cb) {
    var self = this
    var data = [{'data': JSON.stringify({'authors': authors}), 'created_at': createdAt}]
    return services.block.generate_block([], 0, '', '', data, createdAt, function (err, block) {
      if (err) {
        return cb(err)
      } else if (block.height !== 1) {
        return cb(new exceptions.ChainNotEmptyException())
      } else {
        return self.create([block], function (err) {
          if (err) {
            return cb(err)
          } else {
            return cb(null, block)
          }
        })
      }
    })
  }
  return module
}
