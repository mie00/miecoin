var config = require('config')

var Chain = require('./chain')
var Block = require('./block')
var Transaction = require('./transaction')
var Pool = require('./pool')
var Wallet = require('./wallet')
var Network = require('./network')

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
      var network = new Network(this, models)
      this.network = network
    }
}
