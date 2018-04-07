var utils = require('./utils')
var exceptions = require('./exceptions')

module.exports = function (services, models) {
  var module = {}
  module.add = function (blocks) {
    var queries = [models.removeFrom(Math.min.apply(Math, blocks.map((block) => block.height)))]
    return queries.concat(utils.flatMap(blocks, (block) => services.block.add(block)))
  }
  module.create = function (blocks, cb) {
    var queries = module.add(blocks)
    models.transaction(queries, cb)
  }
  module.verify = function (blocks, authors, miningReward, cb) {
    return utils.serial(blocks.map((block) => services.block.verify.bind(services.block, block, authors, miningReward, {}, {})), cb)
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
