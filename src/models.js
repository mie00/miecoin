var _ = require('lodash')

module.exports =
  class Models {
    /**
     * create models
     * @constructor
     * @param {mysql.Connection} connection sql connection
     */
    constructor (connection) {
      this.connection = connection
      this.blockProperties = ['height', 'parent_hash', 'hash', 'public_key', 'signature', 'merkle_root', 'created_at', 'received_at']
      this.transactionProperties = ['block_hash', 'hash', 'block_transaction']
      this.itxProperties = ['tx_hash', 'hash', 'source', 'sign']
      this.otxProperties = ['tx_hash', 'hash', 'amount', 'public_key']
      this.rawDataProperties = ['tx_hash', 'hash', 'data']
    }
    selectUTXO (hashes, blockHeight, cb) {
      return this.connection.query(`SELECT o.amount, o.public_key, o.hash FROM otx AS o LEFT OUTER JOIN itx AS i ON (o.hash = i.source)
                             LEFT OUTER JOIN tx AS it ON (i.tx = it.hash) LEFT OUTER JOIN block ON (it.block_hash = block.hash)
                             WHERE (i.source IS NULL OR block.Height <= ?) AND o.hash in ?`, [blockHeight, hashes],
        function (err, results, fields) {
          return cb(err, results)
        })
    }
    selectUTXOByPublicKey (publicKey, cb) {
      return this.connection.query(`SELECT o.amount, o.public_key, o.hash FROM otx AS o LEFT OUTER JOIN itx AS i ON (o.hash = i.source)
                             LEFT OUTER JOIN tx AS it ON (i.tx = it.hash) LEFT OUTER JOIN block ON (it.block_hash = block.hash)
                             WHERE (i.source IS NULL) AND o.public_key = ?`, [publicKey],
        function (err, results, fields) {
          return cb(err, results)
        })
    }
    selectBlocksByHeight (heights, cb) {
      return this.connection.query('SELECT height, hash FROM block WHERE height in ?', [heights],
        function (err, results, fields) {
          return cb(err, results)
        })
    }
    getChainHeight (cb) {
      this.connection.query('SELECT MAX(height) AS m FROM block',
        function (err, results, fields) {
          if (err) {
            return cb(err)
          } else {
            return cb(null, results.length ? results[0].m : 0)
          }
        })
    }
    getLastBlock (cb) {
      this.connection.query('SELECT * FROM block ORDER BY height DESC LIMIT 1',
        function (err, results, fields) {
          if (err) {
            return cb(err)
          } else {
            return cb(null, results[0])
          }
        })
    }
    getLastBlocks (limit, cb) {
      return this.connection.query('SELECT * FROM block ORDER BY height DESC LIMIT ?', [limit],
        function (err, results, fields) {
          if (err) {
            return cb(err)
          } else {
            return cb(null, results)
          }
        })
    }
    getBlocks (from, limit, cb) {
      return this.connection.query('SELECT * FROM block WHERE height <= ? ORDER BY height DESC LIMIT ?', [from, limit],
        function (err, results, fields) {
          if (err) {
            return cb(err)
          } else {
            return cb(null, results)
          }
        })
    }
    getWholeBlocks (from, limit, cb) {
      var heightMax = from ? 'WHERE height <= ?' : ''
      var params = from ? [from, limit] : [limit]
      return this.connection.query({'sql': `SELECT * FROM block JOIN tx ON (block.hash = tx.block_hash)
      LEFT OUTER JOIN itx ON (tx.hash = itx.tx_hash)
      LEFT OUTER JOIN otx ON (tx.hash = otx.tx_hash)
      LEFT OUTER JOIN raw_data ON (tx.hash = raw_data.tx_hash)
      ${heightMax} ORDER BY height DESC LIMIT ?`,
        nestTables: true}, params,
        function (err, results, fields) {
          if (err) {
            return cb(err)
          }
          var blocks = _.values(_.groupBy(results, (r) => r.block.hash))
          var ret = blocks.map((b) => {
            var block = b[0].block
            var transactions = _.values(_.groupBy(b, (r) => r.tx.hash))
            block.transactions = transactions.map((t) => {
              var transaction = t[0].tx
              var components = _.flatMap(t, (s) => [s.itx, s.otx, s.raw_data]).filter((v) => v.hash)
              transaction.components = components
              return transaction
            })
            return block
          })
          return cb(null, ret)
        })
    }
    getFirstRawData (cb) {
      return this.connection.query(`SELECT raw_data.data FROM raw_data JOIN tx ON (raw_data.tx_hash = tx.hash)
    JOIN block ON (tx.block_hash = block.hash) WHERE block.height = 0`,
        function (err, results, fields) {
          if (err) {
            return cb(err)
          } else {
            return cb(null, results[0])
          }
        })
    }
    getGenesisBlock (cb) {
      return this.connection.query('SELECT * FROM block ORDER BY height ASC LIMIT 1',
        function (err, results, fields) {
          if (err) {
            return cb(err)
          } else {
            return cb(null, results[0])
          }
        })
    }
    removeFrom (height) {
      // It works because of on delete cascade
      return this.connection.format('DELETE FROM block WHERE height = ?', height)
    }
    insert_obj (table, obj) {
      // var keys = Object.keys(obj)
      // var values = keys.map((k) => obj[k])
      // var x = this.connection.format('INSERT INTO ' + table + ' (' + keys.join(', ') + ') VALUES (?)', [values])
      return this.connection.format('INSERT INTO ' + table + ' SET ?', obj)
    }
    add_block (block) {
      return this.insert_obj('block', _.pick(block, this.blockProperties))
    }
    add_transaction (transaction) {
      return this.insert_obj('tx', _.pick(transaction, this.transactionProperties))
    }
    add_itx (itx) {
      return this.insert_obj('itx', _.pick(itx, this.transactionProperties))
    }
    add_otx (otx) {
      return this.insert_obj('otx', _.pick(otx, this.otxProperties))
    }
    add_raw_data (rawData) {
      return this.insert_obj('raw_data', _.pick(rawData, this.rawDataProperties))
    }
    transaction (queries, cb) {
      var self = this
      return self.connection.beginTransaction(function (err) {
        if (err) {
          return cb(err)
        }
        var q = queries.join('; ')
        return self.connection.query(q, function (err) {
          if (err) {
            return self.connection.rollback(function () {
              return cb(err)
            })
          }
          return self.connection.commit(function (err) {
            if (err) {
              return self.connection.rollback(function () {
                return cb(err)
              })
            } else {
              return cb(null)
            }
          })
        })
      })
    }
}
