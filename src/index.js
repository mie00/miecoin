var App = require('./app')
var config = require('config')

var app = new App({
  host: config.get('mysql.host'),
  port: config.get('mysql.port'),
  user: config.get('mysql.username'),
  password: config.get('mysql.password'),
  database: config.get('mysql.database'),
}, {
  username: config.get('rpc.username'),
  password: config.get('rpc.password')
})

var exceptions = require('./exceptions')

const port = config.get('api.port')
const host = config.get('api.host')

var self = `${host}:${port}`

app.services.wallet.setKeyPair(config.get('wallet.private_key'), config.get('wallet.public_key'))
app.services.pool.setKeyPair(config.get('wallet.private_key'), config.get('wallet.public_key'))
app.services.pool.setMiningReward(config.get('mining.reward'))
app.services.chain.setMiningReward(config.get('mining.reward'))
app.services.network.setDefaultPort(config.get('api.port'))

config.get('peers').filter((p) => p !== self).forEach((p) => app.services.network.addPeer(p, function (err, res) {
  if (err) {
    console.log(`Adding ${p} failed ${err}`)
  } else {
    console.log(`Addind ${p} succeeded`)
  }
}))


app.connection.connect(function (err) {
  if (err) {
    throw exceptions.NoDatabaseError()
  }
  var pu = config.get('authority.public_keys')
  var createdAt = config.get('genesis.created_at')
  return app.services.chain.initGenesisBlock(pu, createdAt, (err, block) => {
    if (err instanceof exceptions.GenesisBlockExistsException) {
      console.log(err.message)
    } else if (err) {
      throw err
    } else {
      console.log(`genesis block created successfully with hash ${block.hash}`)
    }
    app.services.recurring.setRecheckNetworkInterval(7000)
    app.services.recurring.setCreateBlockInterval(10000)
    app.app.listen(port, host, () => {
      console.log(`MieCoin listening on port ${port}!`)
      app.services.network.addPeer(self, (err) => {
        if (err instanceof exceptions.MeException) {
          console.log(`Added self successfully`)
        } else {
          console.log(`couldn't add self`)
        }
      })
    })
  })
})