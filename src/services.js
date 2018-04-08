var Chain = require('./chain')
var Block = require('./block')
var Transaction = require('./transaction')
var Pool = require('./pool')
var Wallet = require('./wallet')
var Network = require('./network')
var Recurring = require('./recurring')

module.exports =
  class Servies {
    constructor (models) {
      this.models = models
      this.transaction = new Transaction(this, models)
      this.block = new Block(this, models)
      this.chain = new Chain(this, models)
      this.pool = new Pool(this, models)
      this.wallet = new Wallet(this, models)
      this.network = new Network(this, models)
      this.recurring = new Recurring(this, models)
    }
}
