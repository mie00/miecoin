var should = require('should')

var utils = require('../src/utils')

var assert = require('assert')
describe('utils', function () {
  describe('flatMap', function () {
    it('should work', function () {
      utils.flatMap([[1, 2], [3]], (x) => x).should.match([1, 2, 3])
      utils.flatMap([[1, 2], [3]], (x) => x.map((y) => 2 * y)).should.match([2, 4, 6])
      utils.flatMap([[1, 2], [3]], (x) => [1]).should.match([1, 1])
      utils.flatMap([[{'a': 1}, {'b': 3}], [{'c': 5}]], (x) => x).should.match([{'a': 1}, {'b': 3}, {'c': 5}])
      utils.flatMap([{'c': [1, 2]}, {'c': [5]}], (x) => x.c).should.match([1, 2, 5])
    })
  })
  describe('serial', function () {
    it('should work', function (done) {
      var counter = 0
      var f1 = function (cb) {
        counter += 3
        cb(null)
      }
      var f2 = function (cb) {
        counter += 1
        cb(null)
      }
      utils.serial([f1, f2], function (err) {
        assert(err === null)
        counter.should.equal(4)
        done()
      })
    })
    it('should raise the first error', function (done) {
      var counter = 0
      var f1 = function (cb) {
        counter += 3
        cb(new Error('an error'))
      }
      var f2 = function (cb) {
        counter += 1
        cb(null)
      }
      utils.serial([f1, f2], function (err) {
        err.should.match(new Error('an error'))
        counter.should.equal(3)
        done()
      })
    })
  })
  describe('serial reduce', function () {
    it('should work', function (done) {
      var f1 = function (cb) {
        cb(null, 3)
      }
      var f2 = function (cb) {
        cb(null, 1)
      }
      utils.serialReduce([f1, f2], 0, (x, y) => x + y, function (err, result) {
        assert(err === null)
        result.should.equal(4)
        done()
      })
    })
    it('should raise the first error', function (done) {
      var f1 = function (cb) {
        cb(new Error('an error'))
      }
      var f2 = function (cb) {
        cb(null, 1)
      }
      utils.serialReduce([f1, f2], 0, (x, y) => x + y, function (err) {
        err.should.match(new Error('an error'))
        done()
      })
    })
  })
})
