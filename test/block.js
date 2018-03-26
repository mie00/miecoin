var should = require('should')
var mysql = require('mysql')
var config = require('config')
var assert = require('assert')

var factory = require('./factory')

var exceptions = require('../src/exceptions')
var Block = require('../src/block')
var Transaction = require('../src/transaction')
var services = {}
var Models = require('../src/models')

var connection = mysql.createConnection({
  host: config.get('mysql.host'),
  port: config.get('mysql.port'),
  user: config.get('mysql.username'),
  password: config.get('mysql.password'),
  database: config.get('mysql.test_database')
})
var models = Models(connection)
var transaction = Transaction(services, models)
services.transaction = transaction
var block = Block(services, models)
services.block = block

describe('Block', function () {
  describe('DB', function () {
    before(function (done) {
      connection.connect(done)
    })
    after(function (done) {
      connection.destroy()
      done()
    })

    describe('add', function () {
      it('should work', function () {
        block.add(factory.blocks[0], function (err) {
          assert(err === null)
        })
      })
    })
  })
  describe('verify_authority', function () {
    it('should work', function () {
      block.verify_authority(factory.blocks[0], [factory.pu1]).should.equal(true)
      block.verify_authority(factory.blocks[0], factory.authors).should.equal(true)
      block.verify_authority(factory.blocks[0], [factory.pu2]).should.equal(false)
    })
  })
  describe('verify', function () {
    it('should not verify invalid transaction', function (done) {
      block.verify(factory.blocks[1], factory.authors, 100, {}, {}, function (err) {
        (() => should.ifError(err)).should.throw(new exceptions.InvalidSignatureException())
        done()
      })
    })
  })
})
