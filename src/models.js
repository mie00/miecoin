module.exports =
  class Models {
    /**
     * create models
     * @constructor
     * @param {mysql.Connection} connection sql connection
     */
    constructor (connection) {
      this.connection = connection
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
    getBlocksHeight (cb) {
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
      return this.connection.query('SELECT * FROM block WHERE HEIGHT <= ? ORDER BY height DESC LIMIT ?', [from, limit],
        function (err, results, fields) {
          if (err) {
            return cb(err)
          } else {
            return cb(null, results)
          }
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
    add_block (block) {
      return this.connection.format('INSERT INTO block SET ?', block)
    }
    add_transaction (transaction) {
      return this.connection.format('INSERT INTO tx SET ?', transaction)
    }
    add_itx (itx) {
      return this.connection.format('INSERT INTO itx SET ?', itx)
    }
    add_otx (otx) {
      return this.connection.format('INSERT INTO otx SET ?', otx)
    }
    add_raw_data (rawData) {
      return this.connection.format('INSERT INTO raw_data SET ?', rawData)
    }
    transaction (queries, cb) {
      return this.connection.beginTransaction(function (err) {
        if (err) {
          return cb(err)
        }
        return this.connection.query(queries.join('; '), function (err) {
          if (err) {
            return this.connection.rollback(function () {
              return cb(err)
            })
          }
          return this.connection.commit(function (err) {
            if (err) {
              return this.connection.rollback(function () {
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
