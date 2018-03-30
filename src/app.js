var config = require('config')
const express = require('express')
var mysql = require('mysql')
var ReadWriteLock = require('rwlock')

var exceptions = require('./exceptions')

const app = express()
var connection = mysql.createConnection({
  host: config.get('mysql.host'),
  port: config.get('mysql.port'),
  user: config.get('mysql.username'),
  password: config.get('mysql.password'),
  database: config.get('mysql.database')
})
app.connection = connection

connection.connect(function (err) {
  if (err) {
    throw exceptions.NoDatabaseError()
  }
})

var services = {}
var Models = require('../src/models')

var Chain = require('../src/chain')
var Block = require('../src/block')
var Transaction = require('../src/transaction')
var Pool = require('../src/pool')

var models = Models(connection)
var transaction = Transaction(services, models)
services.transaction = transaction
var block = Block(services, models)
services.block = block
var chain = Chain(services, models)
services.chain = chain
var pool = Pool(services)
services.pool = pool

app.get('/hi', (req, res) => res.send('hey'))

var newTransactionLock = new ReadWriteLock()
app.post('/transaction', (req, res) => {
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
})

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
      return peer.getBlocks(Math.min.apply(Math, blocks.map((block) => block.height)), blocks.length, function (err, res) {
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
app.post('/block', (req, res) => {
  blockSyncLock.writeLock(function (release) {
    processNewBlocks()
  })
})

module.exports = app
