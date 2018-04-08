var ReadWriteLock = require('rwlock')

module.exports = function (services) {
  var module = {}
  var newLock = new ReadWriteLock()
  module.pay = (req, res) => {
    var amount = Number(req.body.amount)
    var publicKey = req.body.to
    var fee = Number(req.body.fee)
    var data = []
    if (req.body.data) {
      data.push(req.body.data)
    }
    if (!amount || !publicKey || !fee) {
      return res.status(404).end()
    }
    newLock.writeLock(function (release) {
      return services.wallet.pay(data, [{
        'amount': req.body.amount,
        'public_key': req.body.to,
        'created_at': Date.now()
      }], req.body.fee, (err) => {
        release()
        if (err) {
          return res.status(404).end()
        } else {
          return res.status(200).end()
        }
      })
    })
  }
  module.getTotal = (req, res) => {
    newLock.readLock(function (release) {
      return services.wallet.getTotal((err, total) => {
        release()
        if (err) {
          return res.status(503).end()
        }
        return res.status(200).send({
          'total': total
        })
      })
    })
  }
  module.createBlock = (req, res) => {
    newLock.writeLock(function (release) {
      release()
      return res.status(503).end()
    })
  }
  return module
}