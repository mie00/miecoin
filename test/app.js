var request = require('supertest')
var App = require('../src/app')
var app = new App()

after(function (done) {
  app.connection.destroy()
  done()
})
describe('get /api/hi', function () {
  it('should return hey', function (done) {
    request(app.app)
      .get('/api/hi')
      .expect('hey', done)
  })
})
