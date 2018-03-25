module.exports = function (connection) {
  var module = {}
  module.selectUTXO = function (hashes, cb) {
    return connection.query(`SELECT o.amount, o.public_key, o.hash FROM otx AS o LEFT OUTER JOIN itx AS i ON (o.hash = i.source)
                             WHERE i.source IS NULL AND o.hash in ?`, [hashes],
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
