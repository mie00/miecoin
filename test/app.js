var request = require('supertest')
var app = require('../src/app')

describe('get /hi', function () {
  after(function (done) {
    app.connection.destroy()
    done()
  })
  it('should return hey', function (done) {
    request(app)
      .get('/hi')
      .expect('hey', done)
  })
})
