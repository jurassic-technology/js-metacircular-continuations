import Node from './Node'

export default class RegExpLiteral extends Node {
  constructor (pattern, flags) {
    super()
    this.type = 'RegularExpressionLiteral'
    this.pattern = pattern
    this.flags = flags
    this.TRAVERSAL_ROUTE = [ ]
  }

  interpret (scope, prevCont) {
    var regex = new RegExp(this.pattern, this.flags)
    return prevCont(regex)
  }


  toAST() {
    var pattern = this.pattern.toAST()
    var flags = this.flags.toAST()
    return {
      type: this.type,
      start: this.start,
      end: this.end,
      patter: pattern,
      flags: flags
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    if (this.extra && this.extra.parenthesized)
      this.nativeSource = "(/" + this.pattern + "/" + this.flags + ')'
    else
      this.nativeSource = "/" + this.pattern + "/" + this.flags

  }
}
