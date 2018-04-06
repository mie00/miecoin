var crypto = require('crypto')
module.exports.sign = function (data, privateKey) {
  return crypto.createSign('ecdsa-with-SHA1').update(data).sign(privateKey, 'base64')
}
module.exports.verify = function (data, publicKey, signature) {
  return crypto.createVerify('ecdsa-with-SHA1').update(data).verify(publicKey, Buffer.from(signature, 'base64'))
}
module.exports.hashBuffer = function hashBuffer (input) {
  return crypto.createHash('sha256').update(input).digest()
}
module.exports.hash = function hash (input) {
  return this.hashBuffer(input).toString('hex')
}
module.exports.hashLength = module.exports.hashBuffer('').length
module.exports.calculate_merkle = function (items) {
  if (items.length === 0) return Buffer.alloc(this.hashLength)
  if (items.length === 1) return items[0]
  var res = []
  for (var i = 0; i < items.length; i += 2) {
    var b0 = items[i]
    var b1 = items[i + 1] || Buffer.alloc(this.hashLength)
    res.push(this.hashBuffer(Buffer.concat([b0, b1])))
  }
  return this.calculate_merkle(res)
}
module.exports.mapBy = function (collection, key) {
  var res = {}
  for (var item of collection) {
    res[item[key]] = item
  }
  return res
}
module.exports.flatten = function (arr) {
  return [].concat(...arr)
}
module.exports.flatMap = function (arr, fn) {
  return this.flatten(arr.map(fn))
}
module.exports.sum = function (arr) {
  return arr.reduce((x, y) => x + y, 0)
}
module.exports.fill = function (buffer, other, start, limit) {
  var min = Math.min(limit, other.length)
  buffer.fill(other, start, start + min)
}
module.exports.gather = function (obj, arr) {
  var res = {}
  for (var elem of arr) {
    res[elem] = obj[elem]
  }
  return res
}

module.exports.serial = function (functions, cb) {
  functions.reverse()
  var onFinish = function (err) {
    return cb(err)
  }
  for (var fun of functions) {
    onFinish = (function (t, v) {
      return function (err) {
        if (err) {
          return v(err)
        } else {
          return t(v)
        }
      }
    })(fun, onFinish)
  }
  return onFinish(null)
}

module.exports.serialReduce = function (functions, init, reduce, cb) {
  functions.reverse()
  var first = true
  var onFinish = function (err, res) {
    if (err) {
      return cb(err)
    } else {
      if (first) {
        first = false
      } else {
        init = reduce(init, res)
      }
      return cb(null, init)
    }
  }
  for (var fun of functions) {
    onFinish = (function (t, v) {
      return function (err, res) {
        if (err) {
          return v(err)
        } else {
          if (first) {
            first = false
          } else {
            init = reduce(init, res)
          }
          return t(v)
        }
      }
    })(fun, onFinish)
  }
  return onFinish(null, init)
}
