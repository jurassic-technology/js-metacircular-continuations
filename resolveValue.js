module.exports = function resolveValue (value, prevCont, prevErrCont) {

  if (value instanceof Promise) {
    return value.then(prevCont, prevErrCont)
  } else {
    return prevErrCont(value)
  }

}
