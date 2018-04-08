var app = require('./app')
var config = require('config')

var exceptions = require('./exceptions')

const port = config.get('api.port')
const host = config.get('api.host')

app.services.network.addPeer(`${host}:${port}`, (err) => {
  if (err instanceof exceptions.MeException) {
    console.log(`Added self successfully`)
  } else {
    console.log(`couldn't add self`)
  }
})

config.get('peers').forEach((p) => app.services.network.addPeer(p, function (err, res) {
  if (err) {
    console.log(`Adding ${p} failed ${err}`)
  } else {
    console.log(`Addind ${p} succeeded`)
  }
}))

app.services.recurring.setRecheckNetworkInterval(7000)
app.services.recurring.setCreateBlockInterval(10000)
app.listen(port, host, () => console.log(`Example app listening on port ${port}!`))
