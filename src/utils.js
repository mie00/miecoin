var crypto = require('crypto')
module.exports.sign = function (buffer, privateKey) {
  return crypto.createSign('ecdsa-with-SHA1').update(buffer).sign(privateKey, 'base64')
}
module.exports.verify = function (buffer, publicKey, signature) {
  return crypto.createVerify('ecdsa-with-SHA1').update(buffer).verify(publicKey, Buffer.from(signature, 'base64'))
}
module.exports.hash = function (input) {
  return crypto.createHash('sha256').update(input).digest('base64')
}
module.exports.calculate_merkle = function (items) {
  if (items.length <= 1) return items[0]
  var res = []
  for (var i = 0; i < items.length; i += 2) {
    var b0 = items[i]
    var b1 = items[i + 1] || Buffer.alloc(0)
    res.push(this.hash(Buffer.concat([b0, b1])))
  }
  return this.calculate_merkle(res)
}
module.exports.groupBy = function (collection, key) {
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
