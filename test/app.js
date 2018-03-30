var request = require('supertest')
var app = require('../src/app')

after(function (done) {
  app.connection.destroy()
  done()
})
describe('get /hi', function () {
  it('should return hey', function (done) {
    request(app)
      .get('/hi')
      .expect('hey', done)
  })
})
