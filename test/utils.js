var should = require('should')

var utils = require('../src/utils')

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
})
