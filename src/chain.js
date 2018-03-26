var utils = require('./utils')

module.exports = function (services, models) {
  var module = {}
  module.add = function (blocks) {
    // TODO: remove old blocks
    return utils.flatMap(blocks, (block) => module.add)
  }
  module.create = function (blocks, cb) {
    var queries = module.add(blocks)
    models.transaction(queries, cb)
  }
  module.verify = function (blocks, authors, miningReward, cb) {
    return utils.serial(blocks.map((block) => services.block.verify.bind(services.block, block, authors, miningReward, {}, {})), cb)
  }
  return module
}
