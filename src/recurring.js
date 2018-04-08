class Recurring {
  constructor (services) {
    this.services = services
    this.recheckNetworkInterval = null
    this.recheckNetworkTask = null
    this.createBlockInterval = null
    this.createBlockMargin = null
    this.createBlockTask = null
  }
  calculateBlockTime() {
    var t = this.createBlockInterval + (Math.random() - 0.5) * 2 * this.createBlockMargin
    return t
  }
  refresh() {
    if (this.createBlockInterval) {
      return this.setCreateBlockInterval(this.createBlockInterval, this.createBlockMargin)
    }
  }
  setRecheckNetworkInterval (time) {
    if (this.recheckNetworkTask) {
      clearInterval(this.recheckNetworkTask)
    }
    this.recheckNetworkInterval = time
    this.recheckNetworkTask = setInterval(this.recheckNetwork.bind(this), time)
  }
  setCreateBlockInterval (time, margin) {
    if (this.createBlockTask) {
      clearInterval(this.createBlockTask)
    }
    this.createBlockInterval = time
    this.createBlockMargin = margin
    this.createBlockTask = setInterval(this.createBlock.bind(this), this.calculateBlockTime())
  }
  recheckNetwork () {
    console.log('rechecking network')
    this.services.network.recheck((err, res) => {
      if (err) {
        return console.log(`error rechecking network ${err}`)
      }
      console.log(`peers available: ${res.available}, unavailable: ${res.unavailable}`)
    })
  }
  createBlock () {
    console.log('creating block')
    this.services.pool.flush((err, block) => {
      if (err) {
        return console.log(`an error happened while creating block ${err}`)
      }
      console.log(`block created height: ${block.height}, hash: ${block.hash}`)
      console.log(`announcing block`)
      this.services.network.announceBlock(block, (err, res) => {
        if (err) {
          return console.log('error announcing block')
        }
        var {accepted, rejected} = res
        return console.log(`block announced accepted: ${accepted}, rejected: ${rejected}`)
      })
    })
  }
}

module.exports = Recurring
