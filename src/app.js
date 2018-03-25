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

app.get('/hi', (req, res) => res.send('hey'))

module.exports = app
