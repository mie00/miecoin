var sinon = require('sinon')
var should = require('should')

var Services = require('../src/services')
var Models = require('../src/models')

var factory = require('./factory')

var exceptions = require('../src/exceptions')

var pr1 = factory.pr1
var pu1 = factory.pu1
var pr2 = factory.pr2
var pu2 = factory.pu2

var authors = [pu1, pu2]
describe('cycle', function () {
  describe('generateGenesisBlock', function () {
    var models = new Models()
    var modelsStub = sinon.stub(models)
    var services = new Services(modelsStub)
    modelsStub.getLastBlock.yields(null, undefined)
    modelsStub.getChainHeight.yields(null, undefined)
    modelsStub.removeFrom.returns('removeFrom')
    modelsStub.add_block.returns('add bl')
    modelsStub.add_transaction.returns('add tr')
    modelsStub.add_raw_data.returns('add rd')
    modelsStub.add_otx.returns('add otx')
    modelsStub.transaction.yields(null)
    it('should work', function (done) {
      var createdAt = 1522727362019
      services.chain.generateGenesisBlock(authors, createdAt, function (err, block) {
        should(err).equal(null)
        block.height.should.equal(1)
        block.created_at.should.equal(createdAt)
        done()
      })
    })
  })
  describe('initGenesisBlock', function () {
    var models = new Models()
    var modelsStub = sinon.stub(models)
    var services = new Services(modelsStub)
    modelsStub.getGenesisBlock.yields(null, undefined)
    modelsStub.getChainHeight.yields(null, undefined)
    modelsStub.removeFrom.returns('removeFrom')
    modelsStub.add_block.returns('add bl')
    modelsStub.add_transaction.returns('add tr')
    modelsStub.add_raw_data.returns('add rd')
    modelsStub.add_otx.returns('add otx')
    modelsStub.transaction.yields(null)
    it('should work', function (done) {
      var createdAt = 1522727362019
      services.chain.initGenesisBlock(authors, createdAt, function (err, block) {
        should(err).equal(null)
        modelsStub.transaction.calledOnce.should.be.true()
        modelsStub.transaction.getCall(0).args[0].should.match(['removeFrom', 'add bl', 'add tr', 'add rd'])
        block.height.should.equal(1)
        block.created_at.should.equal(createdAt)
        done()
      })
    })
  })
  describe('flush', function () {
    var models = new Models()
    var modelsStub = sinon.stub(models)
    var services = new Services(modelsStub)
    modelsStub.getLastBlock.yields(null, factory.genesisBlock)
    modelsStub.getChainHeight.yields(null, 1)
    modelsStub.removeFrom.returns('removeFrom')
    modelsStub.add_block.returns('add bl')
    modelsStub.add_transaction.returns('add tr')
    modelsStub.add_raw_data.returns('add rd')
    modelsStub.add_otx.returns('add otx')
    modelsStub.transaction.yields(null)
    services.pool.setKeyPair(pr1, pu1)
    services.pool.setMiningReward(100)
    it('should work with no transactions', function (done) {
      var createdAt = 1522727362019
      services.pool.flush(function (err, block) {
        should(err).equal(null)
        done()
      })
    })
  })
  describe('wallet.getTotal', function () {
    var services
    var models = new Models()
    var modelsStub = sinon.stub(models)
    before(function () {
      services = new Services(modelsStub)
      services.wallet.setKeyPair(factory.pr1, factory.pu1)
      modelsStub.selectUTXOByPublicKey.yields(null, [factory.firstBlockTransactionUTXO])
    })
    it('should work', function (done) {
      services.wallet.getTotal(function (err, total) {
        should(modelsStub.selectUTXOByPublicKey.getCall(0).args[0]).equal(factory.pu1)
        should(err).equal(null)
        should(total).equal(100)
        done()
      })
    })
  })
  describe('wallet.pay', function () {
    var services
    var models = new Models()
    var modelsStub = sinon.stub(models)
    beforeEach(function () {
      services = new Services(modelsStub)
      services.wallet.setKeyPair(factory.pr1, factory.pu1)
      modelsStub.getChainHeight.yields(null, 2)
      modelsStub.selectUTXOByPublicKey.yields(null, [factory.firstBlockTransactionUTXO])
      modelsStub.selectUTXO.yields(null, [factory.firstBlockTransactionUTXO])
    })
    it('should work', function (done) {
      services.wallet.pay([], [{'amount': 20, 'public_key': factory.pu2}], 10, function (err, transaction) {
        should(err).equal(null)
        transaction.components.length.should.equal(3)
        done()
      })
    })
    it('should work if barely enough money', function (done) {
      services.wallet.pay([], [{'amount': 90, 'public_key': factory.pu2}], 10, function (err, transaction) {
        should(err).equal(null)
        transaction.components.length.should.equal(2)
        done()
      })
    })
    it('should not work if no enough money', function (done) {
      services.wallet.pay([], [{'amount': 90, 'public_key': factory.pu2}], 20, function (err, transaction) {
        (() => should.ifError(err)).should.throw(new exceptions.NotEnoughMoneyToSpendException())
        done()
      })
    })
  })
})
