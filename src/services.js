var config = require('config')

var Chain = require('../src/chain')
var Block = require('../src/block')
var Transaction = require('../src/transaction')
var Pool = require('../src/pool')
var Wallet = require('../src/wallet')

module.exports =
  class Servies {
    constructor (models) {
      this.models = models
      var transaction = Transaction(this, models)
      this.transaction = transaction
      var block = Block(this, models)
      this.block = block
      var chain = Chain(this, models)
      this.chain = chain
      var pool = new Pool(this, models)
      this.pool = pool
      var wallet = Wallet(this, models, config.get('wallet.private_key'), config.get('wallet.public_key'))
      this.wallet = wallet
    }
}
