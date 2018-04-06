var should = require('should')

var utils = require('../src/utils')
var factory = require('./factory')

var assert = require('assert')
describe('utils', function () {
  describe('sign-verify', function () {
    it('shold work for the same key pair', function () {
      var buffer = Buffer.from('aaabbbc')
      var pu = factory.pu1
      var pr = factory.pr1
      var signature = utils.sign(buffer, pr)
      utils.verify(buffer, pu, signature).should.equal(true)
    })
    it('shold not work for differnt key pair', function () {
      var buffer = Buffer.from('aaabbbc')
      var pu = factory.pu1
      var pr = factory.pr2
      var signature = utils.sign(buffer, pr)
      utils.verify(buffer, pu, signature).should.equal(false)
    })
    it('shold not work for differnt buffer', function () {
      var buffer1 = Buffer.from('aaabbbc')
      var pu = factory.pu1
      var pr = factory.pr1
      var buffer2 = Buffer.from('aaabbbca')
      var signature = utils.sign(buffer1, pr)
      utils.verify(buffer2, pu, signature).should.equal(false)
    })
  })
  describe('calculate merkle', function () {
    var zeros = Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex')
    it('should work for no items', function () {
      utils.calculate_merkle([]).should.match(zeros)
    })
    it('should work for one item', function () {
      var buffer = Buffer.from('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
      utils.calculate_merkle([buffer]).should.equal(buffer)
    })
    it('should work for two items', function () {
      var buffer1 = Buffer.from('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
      var buffer2 = Buffer.from('1111111111111111111111111111111111111111111111111111111111111111')
      utils.calculate_merkle([buffer1, buffer2]).should.match(utils.hashBuffer(Buffer.concat([buffer1, buffer2])))
    })
    it('should work for three items', function () {
      var buffer1 = Buffer.from('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
      var buffer2 = Buffer.from('1111111111111111111111111111111111111111111111111111111111111111')
      var buffer3 = Buffer.from('3333333333333333333333333333333333333333333333333333333333333333')
      var hash1 = utils.hashBuffer(Buffer.concat([buffer1, buffer2]))
      var hash2 = utils.hashBuffer(Buffer.concat([buffer3, zeros]))
      var hash3 = utils.hashBuffer(Buffer.concat([hash1, hash2]))
      utils.calculate_merkle([buffer1, buffer2, buffer3]).should.match(hash3)
    })
  })
  describe('hashBuffer', function () {
    it('should work', function () {
      utils.hashBuffer(Buffer.from('')).toString('hex').should.equal('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
      utils.hashBuffer(Buffer.from('mie')).toString('hex').should.equal('298cf30c31d3d1bd262550cb58fc0ca5a6f8e1fbeb6ca6f6cca15744bbd6bd0a')
    })
  })
  describe('hash', function () {
    it('should work', function () {
      utils.hash('').should.equal('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
      utils.hash('mie').should.equal('298cf30c31d3d1bd262550cb58fc0ca5a6f8e1fbeb6ca6f6cca15744bbd6bd0a')
    })
  })
  describe('mapBy', function () {
    it('should work', function () {
      utils.mapBy([{'a': 'm'}, {'a': 'n'}], 'a').should.match({'m': {'a': 'm'}, 'n': {'a': 'n'}})
    })
  })
  describe('sum', function () {
    it('should work', function () {
      utils.sum([1, 2, 3]).should.equal(6)
      utils.sum([1]).should.equal(1)
      utils.sum([0]).should.equal(0)
    })
  })
  describe('fill', function () {
    it('should work in typical case', function () {
      var buffer1 = Buffer.from('aaaabbbb')
      var buffer2 = Buffer.from('ccc')
      var result = Buffer.from('aacccbbb')
      utils.fill(buffer1, buffer2, 2, 3)
      buffer1.compare(result).should.equal(0)
    })
    it('should work if other is not copied entirely', function () {
      var buffer1 = Buffer.from('aaaabbbb')
      var buffer2 = Buffer.from('ccc')
      var result = Buffer.from('aaccbbbb')
      utils.fill(buffer1, buffer2, 2, 2)
      buffer1.compare(result).should.equal(0)
    })
    it('should leave the extra chars as is', function () {
      var buffer1 = Buffer.from('aaaabbbb')
      var buffer2 = Buffer.from('ccc')
      var result = Buffer.from('aacccbbb')
      utils.fill(buffer1, buffer2, 2, 4)
      buffer1.compare(result).should.equal(0)
    })
  })
  describe('gather', function () {
    it('should work', function () {
      utils.gather({'a': 3, 'b': 2}, ['a', 'b']).should.match({'a': 3, 'b': 2})
      utils.gather({'a': 3, 'b': 2}, ['a']).should.match({'a': 3})
      utils.gather({'a': 3, 'b': 2}, []).should.match({})
      utils.gather({}, []).should.match({})
    })
    it('should not return extra values', function () {
      utils.gather({'a': 3, 'b': 2}, ['a', 'b', 'c']).should.match({'a': 3, 'b': 2})
    })
  })
  describe('flatten', function () {
    it('should work', function () {
      utils.flatten([[1, 2], [3, 4]]).should.match([1, 2, 3, 4])
      utils.flatten([[1, 2]]).should.match([1, 2])
      utils.flatten([]).should.match([])
    })
  })
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
    it('should work with no inputs', function (done) {
      utils.serialReduce([], 1, (x, y) => x * y, function (err, res) {
        should(err).match(null)
        res.should.equal(1)
        done()
      })
    })
  })
})
