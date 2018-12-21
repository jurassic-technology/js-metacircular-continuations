const chai = require('chai')
const parser = require('@babel/parser').parse

class AsyncScope extends Map {
  constructor (parent) { 
    super()
    this.parent = parent
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

}

const AsyncInterpreter = require('../AsyncInterpreter')(AsyncScope, parser) 

module.exports.AsyncInterpreter = AsyncInterpreter
module.exports.chai = chai
module.exports.expect = chai.expect

