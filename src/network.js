var Peer = require('./peer')
var utils = require('./utils')
var exceptions = require('./exceptions')

class Network {
  /**
 * @param {string} point host:port
 */
  constructor () {
    this.peers = {}
  }

  addPeer (point) {
    this.peers[point] = new Peer(point)
  }

  /**
   * Announce transaction
   *
   * @param {Transaction} transaction - The transaction to announce
   * @param {emptyCallback} cb - A callback to run after the request finishes
   */
  announceTransaction (transaction, cb) {
    return utils.parallerAgg(this.peers.map((peer) => peer.announceTransaction.bind(peer, transaction)), function (errs, ress) {
      var onlyErrs = errs.filter((x) => x)
      if (onlyErrs.length) {
        return cb(new exceptions.MultipleExceptionsException(onlyErrs))
      }
      return cb()
    })
  }
  /**
   * Announce block
   *
   * @param {Block} block - The block to announce
   * @param {emptyCallback} cb - A callback to run after the request finishes
   */
  announceBlock (block, cb) {
    return utils.parallerAgg(this.peers.map((peer) => peer.announceTransaction.bind(peer, block)), function (errs, ress) {
      var onlyErrs = errs.filter((x) => x)
      if (onlyErrs.length) {
        return cb(new exceptions.MultipleExceptionsException(onlyErrs))
      }
      return cb()
    })
  }
}

module.exports = Network
