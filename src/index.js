var app = require('./app')
var config = require('config')

const port = config.get('api.port')

config.get('peers').forEach((p) => app.services.network.addPeer(p, function (err, res) {
  if (err) {
    console.log(`Adding ${p} failed ${err}`)
  } else {
    console.log(`Addind ${p} succeeded`)
  }
}))

app.services.recurring.setRecheckNetworkInterval(5000)
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
