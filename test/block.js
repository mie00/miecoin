var sinon = require('sinon')
var should = require('should')

var Services = require('../src/services')
var Models = require('../src/models')

var assert = require('assert')

var factory = require('./factory')

var exceptions = require('../src/exceptions')

describe('Block', function () {
  var models = new Models()
  var modelsStub = sinon.stub(models)
  var services = new Services(modelsStub)
  describe('DB', function () {
    describe('add', function () {
      it('should work', function () {
        var queries = services.block.add(factory.blocks[0])
        queries.should.be.an.Array()
        queries.length.should.be.above(0)
      })
    })
  })
  describe('verify_authority', function () {
    it('should work', function () {
      services.block.verify_authority(factory.blocks[0], [factory.pu1]).should.equal(true)
      services.block.verify_authority(factory.blocks[0], factory.authors).should.equal(true)
      services.block.verify_authority(factory.blocks[0], [factory.pu2]).should.equal(false)
    })
  })
  describe('verify', function () {
    it('should not verify invalid transaction', function (done) {
      services.block.verify(factory.blocks[1], factory.authors, 100, {}, {}, function (err) {
        (() => should.ifError(err)).should.throw(new exceptions.InvalidSignatureException())
        done()
      })
    })
  })
})
