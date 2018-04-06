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

var Models = require('../src/models')
var models = new Models(connection)

var Services = require('./services')
var services = new Services(models)

var apiController = require('./api_controller')(services)
var rpcController = require('./rpc_controller')(services)

app.get('/api/hi', apiController.hi)
app.post('/api/transaction', apiController.announceTransaction)
app.post('/api/block', apiController.announceBlock)
app.get('/api/block', apiController.listBlocks)

app.all('/rpc/.*', (req, res, next) => {
  var auth = req.headers['authorization']
  var token = Buffer.from(config.get('rpc.username') + config.get('rpc.password')).toString('base64')
  var expected = 'Basic ' + token
  if (expected === auth) {
    return next()
  } else {
    return res.send(401).end()
  }
})
app.post('/rpc/block', rpcController.createBlock)
app.get('/rpc/total', rpcController.getTotal)
app.post('/rpc/pay', rpcController.pay)

module.exports = app
