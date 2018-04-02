var utils = require('./utils')

module.exports = function (services, models) {
  var module = {}
  module.add = function (blocks) {
    var queries = [models.removeFrom(Math.min.apply(Math, blocks.map((block) => block.height)))]
    return queries.concat(utils.flatMap(blocks, (block) => module.add))
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
    if (from) {
      return models.getBlocks(from, limit, cb)
    } else {
      return models.getLastBlocks(limit, cb)
    }
  }
  return module
}
