class Recurring {
  constructor (services) {
    this.services = services
    this.recheckNetworkInterval = null
    this.recheckNetworkTask = null
  }
  setRecheckNetworkInterval (time) {
    if (this.recheckNetwork) {
      clearInterval(this.recheckNetwork)
    }
    this.recheckNetworkInterval = time
    this.recheckNetworkTask = setInterval(this.recheckNetwork.bind(this), time)
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
}

module.exports = Recurring
