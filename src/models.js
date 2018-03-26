module.exports = function (connection) {
  var module = {}
  module.selectUTXO = function (hashes, blockHeight, cb) {
    return connection.query(`SELECT o.amount, o.public_key, o.hash FROM otx AS o LEFT OUTER JOIN itx AS i ON (o.hash = i.source)
                             LEFT OUTER JOIN tx AS it ON (i.tx = it.hash) LEFT OUTER JOIN block ON (it.block_hash = block.hash)
                             WHERE (i.source IS NULL OR block.Height <= ?) AND o.hash in ?`, [blockHeight, hashes],
      function (err, results, fields) {
        return cb(err, results)
      })
  }
  module.selectBlocksByHeight = function (heights, cb) {
    connection.query('SELECT height, hash FROM block WHERE height in ?', [heights],
      function (err, results, fields) {
        return cb(err, results)
      })
  }
  module.getBlocksHeight = function (cb) {
    connection.query('SELECT MAX(height) AS m FROM block',
      function (err, results, fields) {
        if (err) {
          return cb(err)
        } else {
          return cb(null, results.length ? results[0].m : 0)
        }
      })
  }
  module.getLastBlock = function (cb) {
    connection.query('SELECT * FROM block ORDER BY height DESC LIMIT 1',
      function (err, results, fields) {
        if (err) {
          return cb(err)
        } else {
          return cb(null, results[0])
        }
      })
  }
  module.add_block = function (block) {
    return connection.format('INSERT INTO block SET ?', block)
  }
  module.add_transaction = function (transaction) {
    return connection.format('INSERT INTO tx SET ?', transaction)
  }
  module.add_itx = function (itx) {
    return connection.format('INSERT INTO itx SET ?', itx)
  }
  module.add_otx = function (itx) {
    return connection.format('INSERT INTO otx SET ?', otx)
  }
  module.add_raw_data = function (rawData) {
    return connection.format('INSERT INTO raw_data SET ?', rawData)
  }
  module.transaction = function (queries, cb) {
    return connection.beginTransaction(function (err) {
      if (err) {
        return cb(err)
      }
      return connection.query(queries.join('; '), function (err) {
        if (err) {
          return connection.rollback(function () {
            return cb(err)
          })
        }
        return connection.commit(function (err) {
          if (err) {
            return connection.rollback(function () {
              return cb(err)
            })
          }
        })
      })
    })
  }
  return module
}
