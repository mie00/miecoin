var exceptions = require('./exceptions')
var utils = require('./utils')

module.exports = function (services, models) {
  var module = {}
  module.add = function (block, cb) {
    var queries = [models.add_block(utils.gather(block,
      ['height', 'parent_hash', 'hash', 'public_key',
        'signature', 'merkle_root', 'created_at', 'received_at']))]
    queries = queries.concat(services.transaction.add_transactions(block.transactions))
    models.transaction(queries, cb)
  }
  module.sign = function (block, privateKey) {
    var buffer = this.to_buffer(block)
    return utils.sign(buffer, privateKey)
  }
  module.verify = function (block, authors, cb) {
    if (!this.verify_authority(block, authors)) {
      return cb(new exceptions.UnauthorizedException())
    }
    if (!this.verify_signature(block)) {
      return cb(new exceptions.InvalidSignatureException())
    }
    return this.verify_chain(block, function (err) {
      if (err) {
        return cb(err)
      }
      return this.verify_transactions(block, function (err) {
        if (err) {
          return cb(err)
        }
        return cb(null)
      })
    })
  }
  module.to_buffer = function (block) {
    var buffer = Buffer.alloc(4 + 256 + 1024 + 256 + 4)
    var cursor = 0
    buffer.writeInt32BE(block.height, cursor)
    cursor += 4
    utils.fill(buffer, block.parent_hash, cursor, 256)
    cursor += 256
    utils.fill(buffer, block.public_key, cursor, 1024)
    cursor += 1024
    utils.fill(buffer, block.merkle_root, cursor, 256)
    cursor += 256
    buffer.writeInt32BE(block.created_at)
    cursor += 4
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
  module.verify_parent = function (block, cb) {
    return models.selectBlocksByHeight([block.height, block.height - 1],
      function (err, results) {
        if (err) return cb(err)
        var parent = results.filter((x) => x.height === block.height - 1 && x.hash === block.parent_hash)[0]
        if (!parent) {
          return cb(new exceptions.UnknownParentException())
        }
        var duplicate = results.filter((x) => x.height === block.height && x.hash === block.hash)[0]
        if (duplicate) {
          return cb(new exceptions.DuplicateBlockException())
        }
      })
  }
  module.verify_transactions = function (block, cb) {
    services.transaction.verify_merkle(block, cb)
  }
  return module
}
