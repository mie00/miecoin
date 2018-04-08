var NoDatabaseError = module.exports.NoDatabaseError = function NoDatabaseError (message) {
  this.message = message
  this.name = 'NoDatabaseError'
  Error.captureStackTrace(this, NoDatabaseError)
}
NoDatabaseError.prototype = Object.create(Error.prototype)

var UnauthorizedException = module.exports.UnauthorizedException = function UnauthorizedException (message) {
  this.message = message
  this.name = 'UnauthorizedException'
  Error.captureStackTrace(this, UnauthorizedException)
}
UnauthorizedException.prototype = Object.create(Error.prototype)

var InvalidSignatureException = module.exports.InvalidSignatureException = function InvalidSignatureException (message) {
  this.message = message
  this.name = 'InvalidSignatureException'
  Error.captureStackTrace(this, InvalidSignatureException)
}
InvalidSignatureException.prototype = Object.create(Error.prototype)

var UnknownParentException = module.exports.UnknownParentException = function UnknownParentException (message) {
  this.message = message
  this.name = 'UnknownParentException'
  Error.captureStackTrace(this, UnknownParentException)
}
UnknownParentException.prototype = Object.create(Error.prototype)

var DuplicateBlockException = module.exports.DuplicateBlockException = function DuplicateBlockException (height, hash) {
  this.height = height
  this.hash = hash
  this.name = 'DuplicateBlockException'
  Error.captureStackTrace(this, DuplicateBlockException)
}
DuplicateBlockException.prototype = Object.create(Error.prototype)

var InvalidTransactionsException = module.exports.InvalidTransactionsException = function InvalidTransactionsException (message) {
  this.message = message
  this.name = 'InvalidTransactionsException'
  Error.captureStackTrace(this, InvalidTransactionsException)
}
InvalidTransactionsException.prototype = Object.create(Error.prototype)

var InvalidMerklerRootException = module.exports.InvalidMerklerRootException = function InvalidMerklerRootException (message) {
  this.message = message
  this.name = 'InvalidMerklerRootException'
  Error.captureStackTrace(this, InvalidMerklerRootException)
}
InvalidMerklerRootException.prototype = Object.create(Error.prototype)

var UnknownComponentTypeException = module.exports.UnknownComponentTypeException = function UnknownComponentTypeException (message) {
  this.message = message
  this.name = 'UnknownComponentTypeException'
  Error.captureStackTrace(this, UnknownComponentTypeException)
}
UnknownComponentTypeException.prototype = Object.create(Error.prototype)

var OverSpendingException = module.exports.OverSpendingException = function OverSpendingException (message) {
  this.message = message
  this.name = 'OverSpendingException'
  Error.captureStackTrace(this, OverSpendingException)
}
OverSpendingException.prototype = Object.create(Error.prototype)

var NonMatchingInOutException = module.exports.NonMatchingInOutException = function NonMatchingInOutException (message) {
  this.message = message
  this.name = 'NonMatchingInOutException'
  Error.captureStackTrace(this, NonMatchingInOutException)
}
NonMatchingInOutException.prototype = Object.create(Error.prototype)

var InvalidTransactionSignatureException = module.exports.InvalidTransactionSignatureException = function InvalidTransactionSignatureException (message) {
  this.message = message
  this.name = 'InvalidTransactionSignatureException'
  Error.captureStackTrace(this, InvalidTransactionSignatureException)
}
InvalidTransactionSignatureException.prototype = Object.create(Error.prototype)

var UnavailableAmountException = module.exports.UnavailableAmountException = function UnavailableAmountException (message) {
  this.message = message
  this.name = 'UnavailableAmountException'
  Error.captureStackTrace(this, UnavailableAmountException)
}
UnavailableAmountException.prototype = Object.create(Error.prototype)

var DoubleSpendingException = module.exports.DoubleSpendingException = function DoubleSpendingException (message) {
  this.message = message
  this.name = 'DoubleSpendingException'
  Error.captureStackTrace(this, DoubleSpendingException)
}
DoubleSpendingException.prototype = Object.create(Error.prototype)

var SameHeightException = module.exports.SameHeightException = function SameHeightException (height) {
  this.height = height
  this.name = 'SameHeightException'
  Error.captureStackTrace(this, SameHeightException)
}
SameHeightException.prototype = Object.create(Error.prototype)

var ItxInBlockTransactionException = module.exports.ItxInBlockTransactionException = function ItxInBlockTransactionException (message) {
  this.message = message
  this.name = 'ItxInBlockTransactionException'
  Error.captureStackTrace(this, ItxInBlockTransactionException)
}
ItxInBlockTransactionException.prototype = Object.create(Error.prototype)

var NotEnoughMoneyToSpendException = module.exports.NotEnoughMoneyToSpendException = function NotEnoughMoneyToSpendException (message) {
  this.message = message
  this.name = 'NotEnoughMoneyToSpendException'
  Error.captureStackTrace(this, NotEnoughMoneyToSpendException)
}
NotEnoughMoneyToSpendException.prototype = Object.create(Error.prototype)

var GenesisBlockExistsException = module.exports.GenesisBlockExistsException = function GenesisBlockExistsException (message) {
  this.message = message
  this.name = 'GenesisBlockExistsException'
  Error.captureStackTrace(this, GenesisBlockExistsException)
}
GenesisBlockExistsException.prototype = Object.create(Error.prototype)

var ChainNotEmptyException = module.exports.ChainNotEmptyException = function ChainNotEmptyException (message) {
  this.message = message
  this.name = 'ChainNotEmptyException'
  Error.captureStackTrace(this, ChainNotEmptyException)
}
ChainNotEmptyException.prototype = Object.create(Error.prototype)

var MultipleExceptionsException = module.exports.MultipleExceptionsException = function MultipleExceptionsException (exceptions) {
  this.exceptions = exceptions
  this.name = 'MultipleExceptionsException'
  Error.captureStackTrace(this, MultipleExceptionsException)
}
MultipleExceptionsException.prototype = Object.create(Error.prototype)

var MeException = module.exports.MeException = function MeException (message) {
  this.message = message
  this.name = 'MeException'
  Error.captureStackTrace(this, MeException)
}
MeException.prototype = Object.create(Error.prototype)

var HTTPException = module.exports.HTTPException = function HTTPException (status, body) {
  this.status = status
  this.body = body
  this.name = 'HTTPException'
  Error.captureStackTrace(this, HTTPException)
}
HTTPException.prototype = Object.create(Error.prototype)

var DifferenetChainException = module.exports.DifferenetChainException = function DifferenetChainException (message) {
  this.message = message
  this.name = 'DifferenetChainException'
  Error.captureStackTrace(this, DifferenetChainException)
}
DifferenetChainException.prototype = Object.create(Error.prototype)
