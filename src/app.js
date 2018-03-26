var config = require('config')
const express = require('express')
var mysql = require('mysql')

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
app.post('/transaction', (req, res) => {
  services.pool.add(req.body, function (err, res) {
    if (err) {
      return res.status(404).end()
    } else {
      return res.status(200).end()
    }
  })
})

module.exports = app
