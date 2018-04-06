var config = require('config')
var request = require('request')

var utils = require('./utils')

class Peer {
  /**
 * @param {string} point host:port
 */
  constructor (point) {
    this.point = point
  }
  get ip () {
    return this.point.split(':')[0]
  }
  get port () {
    return this.point.split(':')[1] || config.get('api.port')
  }

  /**
   * Callback for hi.
   *
   * @callback emptyCallback
   * @param {Error} err An error
   */

  /**
   * Say hi to the other node
   *
   * @param {emptyCallback} cb - A callback to run after the request finishes
   */
  hi (cb) {
    return request.get(`http://${this.point}/api/hi`, cb)
  }

  /**
   * Challenge peer
   *
   * @param {emptyCallback} cb - A callback to run after the request finishes
   */
  publicKey (cb) {
    var challenge = String(Math.random())
    return request.get(`http://${this.point}/api/public_key`, {qs: {challenge: challenge}}, function (err, response, text) {
      if (err) {
        return cb(err)
      }
      if (response.statusCode !== 200) {
        return cb(null, null)
      }
      var body = JSON.parse(text)
      if (body && utils.verify(challenge, body.public_key, body.response)) {
        return cb(null, body.public_key)
      }
      return cb(null, null)
    })
  }
  /**
   * Ask if he owns one of these public keys
   *
   * @param {Array.<string>} pu - The public keys
   * @param {emptyCallback} cb - A callback to run after the request finishes
   */
  areYou (pu, cb) {
    var challenge = String(Math.random())
    return request.get(`http://${this.point}/api/areyou`, {qs: {pu: pu, challenge: challenge}}, function (err, response, text) {
      if (err) {
        return cb(err)
      }
      if (response.statusCode !== 200) {
        return cb(null, null)
      }
      var body = JSON.parse(text)
      if (body && pu.indexOf(body.public_key) !== -1 && utils.verify(challenge, body.public_key, body.response)) {
        return cb(null, body.public_key)
      }
    })
  }
  /**
   * Announce transaction
   *
   * @param {Transaction} transaction - The transaction to announce
   * @param {emptyCallback} cb - A callback to run after the request finishes
   */
  announceTransaction (transaction, cb) {
    return request.post(`http://${this.point}/api/transaction`, {data: {transaction: transaction}}, cb)
  }
  /**
   * Announce block
   *
   * @param {Block} block - The block to announce
   * @param {emptyCallback} cb - A callback to run after the request finishes
   */
  announceBlock (block, cb) {
    return request.post(`http://${this.point}/api/block`, {data: {block: block}}, cb)
  }

  /**
   * Callback for listBlocks.
   *
   * @callback listBlocksCallback
   * @param {Error} err An error
   * @param {Array.<Block>} blocks Blocks
   */

  /**
   * list blocks
   *
   * @param {int} from - list blocks <= this height
   * @param {int} limit - list up to this number of blocks
   * @param {listBlocksCallback} cb - A callback to run after the request finishes
   */
  listBlocks (from, limit, cb) {
    return request.get(`http://${this.point}/api/block`, {qs: {from: from, limit: limit}}, cb)
  }
}

module.exports = Peer
