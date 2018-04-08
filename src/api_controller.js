var config = require('config')
var ReadWriteLock = require('rwlock')
var _ = require('lodash')

var exceptions = require('./exceptions')
var Peer = require('./peer')

module.exports = function (services) {
  var module = {}
  module.hi = (req, res) => res.send('hey')
  module.areYou = (req, res, next) => {
    var pu = _.isArray(req.query.pu) ? req.quer.pu : [req.query.pu]
    pu = pu.map((x) => x.replace(/\\n/g, '\n'))
    services.wallet.areYou(pu, req.query.challenge, (err, resp) => {
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
  module.publicKey = (req, res, next) => {
    services.wallet.challenge(req.query.challenge, (err, resp) => {
      if (err) {
        return next(err)
      }
      return res.status(200).send(resp)
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
        services.chain.verify(blocks, keys, config.get('mining.reward'), function (err, min) {
          if (err) {
            return cb(err)
          } else {
            var newBlocks = blocks.filter((block) => block.height >= min)
            services.chain.create(newBlocks, function (err) {
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
        if (Math.min.apply(Math, blocks.map((b) => b.height)) > 2) {
          return peer.listBlocks(Math.min.apply(Math, blocks.map((block) => block.height)) - 1, blocks.length,
            function (err, res) {
              if (err) {
                return cb(err)
              } else {
                var n = res.filter((block) => block.height > 1)
                return processNewBlocks(blocks.concat(n), peer, cb)
              }
            })
        } else {
          return cb(new exceptions.DifferenetChainException())
        }
      } else {
        return cb(err)
      }
    })
  }

  var blockSyncLock = new ReadWriteLock()
  module.announceBlock = (req, res) => {
    blockSyncLock.writeLock(function (release) {
      processNewBlocks([req.body.block], new Peer(req.body.self, services.network), (err) => {
        if (err) {
          console.log(`error block height: ${req.body.block.height} hash:${req.body.block.hash} ${err}`)
        } else {
          console.log(`got block height: ${req.body.block.height} hash:${req.body.block.hash}`)
        }
        res.status(err ? 404 : 200).end()
        release()
      })
    })
  }
  module.listBlocks = (req, res) => {
    return services.chain.getBlocks(Number(req.query.from), Number(req.query.limit) || 1, (err, blocks) => {
      res.status(err ? 404 : 200).send({
        'blocks': blocks
      })
    })
  }
  return module
}