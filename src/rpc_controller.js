var config = require('config')
var ReadWriteLock = require('rwlock')

module.exports = function (services) {
  var module = {}
  var newLock = new ReadWriteLock()
  module.pay = (req, res) => {
    newLock.writeLock(function (release) {
      return services.block.getBlockHeight((err, height) => {
        return services.wallet.pay([], {'amount': req.body.amount, 'public_key': req.body.to}, config.get('fee'), height, (err) => {
          release()
          if (err) {
            return res.send(200).end()
          } else {
            return res.send(404).end()
          }
        })
      })
    })
  }
  module.getTotal = (req, res) => {
    newLock.readLock(function (release) {
      release()
      return res.send(503).end()
    })
  }
  module.createBlock = (req, res) => {
    newLock.writeLock(function (release) {
      release()
      return res.send(503).end()
    })
  }
  return module
}
