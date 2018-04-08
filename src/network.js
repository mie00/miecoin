var config = require('config')

var Peer = require('./peer')
var utils = require('./utils')
var exceptions = require('./exceptions')

var _ = require('lodash')

class Network {
  /**
 * @param {string} point host:port
 */
  constructor (services) {
    this.services = services
    this.self = null
    this.peers = {}
    this.unavailable = []
    this.defaultPort = config.get('api.port')
  }

  recheck (cb) {
    return this.recheckUnavailable((err) => {
      if (err) {
        return cb(err)
      }
      return this.recheckAvailable((err) => {
        if (err) {
          return cb(err)
        }
        return cb(null, {'available': _.keys(this.peers).length, 'unavailable': this.unavailable.length})
      })
    })
  }
  recheckAvailable (cb) {
    var peers = _.keys(this.peers)
    return utils.parallelAgg(peers.map((p) => this.peers[p].hi.bind(this.peers[p])), (errs, ress) => {
      var unavailable = peers.filter((x, i) => errs[i])
      for (var u of unavailable) {
        delete this.peers[u]
        this.unavailable.push(u)
      }
      cb(null, ress.filter((x) => x).length)
    })
  }
  recheckUnavailable (cb) {
    return utils.parallelAgg(this.unavailable.map((u) => this.addPeer.bind(this, u)), (errs, ress) => {
      this.unavailable = this.unavailable.filter((x, i) => errs[i])
      cb(null, ress.filter((x) => x).length)
    })
  }

  addPeer (point, cb) {
    var peer = new Peer(point, this)
    peer.publicKey((err, res) => {
      if (err) {
        this.unavailable.push(point)
        return cb(err)
      }
      if (res === this.services.wallet.publicKey) {
        this.self = point
        return cb(new exceptions.MeException())
      } else {
        this.peers[point] = peer
        return cb(null, peer)
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
    return utils.parallelAgg(_.values(this.peers).map((peer) => peer.announceTransaction.bind(peer, transaction)), function (errs, ress) {
      var onlyErrs = errs.filter((x) => x)
      if (onlyErrs.length) {
        return cb(new exceptions.MultipleExceptionsException(onlyErrs))
      }
      return cb(null, ress.filter((x) => x).length)
    })
  }
  /**
   * Announce block
   *
   * @param {Block} block - The block to announce
   * @param {emptyCallback} cb - A callback to run after the request finishes
   */
  announceBlock (block, cb) {
    return utils.parallelAgg(_.values(this.peers).map((peer) => peer.announceBlock.bind(peer, block)), function (errs, ress) {
      var onlyErrs = errs.filter((x) => x)
      if (onlyErrs.length) {
        return cb(new exceptions.MultipleExceptionsException(onlyErrs))
      }
      return cb(null, ress.filter((x) => x).length)
    })
  }
}

module.exports = Network
