import parser from '@babel/parser'

class AsyncScope extends Map {

  constructor (parent) {

    if (typeof code === 'string') this.ast = parser.parse(code)
    else this.ast = code 

    if (parent) this.parent = parent

  } 

  get (name) {
    if (this.has(name)) return super.get(name)
    else if (this.parent) return this.parent.get(name) 
    else throw new Error(name + ' is not defined') 
  }

  declare (name, value) {
    this.set(name, value) 
  }

  spawn (ast) {

  } 


}
