const chai = require('chai')
const parse = require('@babel/parser').parse
const parseExpression = require('@babel/parser').parseExpression

class AsyncScope extends Map {
  constructor (parent) { 
    super()
    this.parent = parent
  }

  getRoot () {
    if (this.parent) return this.parent.getRoot()
    return this 
  }

  getParent () {
    return this.parent 
  }

  has (name) {
    if (super.has(name)) return true
    else if (this.parent) return this.parent.has(name) 
    else return false 
  }

  get (name) {
    if (super.has(name)) return super.get(name) 
    else if (this.parent.has(name)) return this.parent.get(name)
  }
  
  declare (name, value) {
    const returnValue = super.set(name, value)
    return returnValue
  }

  set (name, value) {
    if (super.has(name)) return super.set(name, value)
    else if (this.parent && this.parent.has(name)) return this.parent.set(name, value)
    else throw new ReferenceError(name + ' is not defined')
  }

}

const AsyncInterpreter = require('../AsyncInterpreter')(AsyncScope, parse, parseExpression) 

module.exports.AsyncInterpreter = AsyncInterpreter
module.exports.chai = chai
module.exports.expect = chai.expect

