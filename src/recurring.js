class Recurring {
  constructor (services) {
    this.services = services
    this.recheckNetworkInterval = null
    this.recheckNetworkTask = null
    this.createBlockInterval = null
    this.createBlockTask = null
  }
  setRecheckNetworkInterval (time) {
    if (this.recheckNetworkTask) {
      clearInterval(this.recheckNetworkTask)
    }
    this.recheckNetworkInterval = time
    this.recheckNetworkTask = setInterval(this.recheckNetwork.bind(this), time)
  }
  setCreateBlockInterval (time) {
    if (this.createBlockTask) {
      clearInterval(this.createBlockTask)
    }
    this.createBlockInterval = time
    this.createBlockTask = setInterval(this.createBlock.bind(this), time)
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
    this.services.pool.flush([], (err, res) => {
      if (err) {
        return console.log(`an error happened while creating block ${err}`)
      }
      return console.log(`block created`)
    })
  }
}

module.exports = Recurring
