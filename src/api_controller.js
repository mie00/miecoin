var config = require('config')
var ReadWriteLock = require('rwlock')

var exceptions = require('./exceptions')
var Peer = require('./peer')

module.exports = function (services) {
  var module = {}
  module.hi = (req, res) => res.send('hey')
  module.areYou = (req, res, next) => {
    services.wallet.areYou(req.pu, req.challenge, (err, resp) => {
      if (err) {
        return next(err)
      }
      if (resp) {
        return res.status(200).send(resp)
      } else {
        return res.status(400).end()
      }
    })
  }
  var newTransactionLock = new ReadWriteLock()
  module.announceTransaction = (req, res) => {
    newTransactionLock.writeLock(function (release) {
      services.pool.add(req.body.transaction, function (err, res) {
        release()
        if (err) {
          return res.status(404).end()
        } else {
          return res.status(200).end()
        }
      })
    })
  }
  var addBlocks = function (blocks, cb) {
    services.block.getAuthorizedKeys(function (err, keys) {
      if (err) {
        return cb(err)
      } else {
        services.chain.verify(blocks, keys, config.get('mining.reward'), function (err) {
          if (err) {
            return cb(err)
          } else {
            services.chain.add(blocks, function (err) {
              if (err) {
                return cb(err)
              } else {
                return cb(null)
              }
            })
          }
        })
      }
    })
  }

  var processNewBlocks = function (blocks, peer, cb) {
    return addBlocks(blocks, function (err) {
      if (!err) {
        return cb(null)
      } else if (err instanceof exceptions.UnknownParentException) {
        return peer.listBlocks(Math.min.apply(Math, blocks.map((block) => block.height)), blocks.length, function (err, res) {
          if (err) {
            return cb(err)
          } else {
            return processNewBlocks(res.concat(blocks), peer, cb)
          }
        })
      }
    })
  }

  var blockSyncLock = new ReadWriteLock()
  module.announceBlock = (req, res) => {
    blockSyncLock.writeLock(function (release) {
      processNewBlocks(req.body, new Peer(req.ip), (err) => {
        res.status(err ? 404 : 200).end()
      })
    })
  }
  module.listBlocks = (req, res) => {
    return services.chain.getBlocks(req.query.from, req.query.limit, (err, blocks) => {
      res.status(err ? 404 : 200).end({'blocks': blocks})
    })
  }
  return module
}
