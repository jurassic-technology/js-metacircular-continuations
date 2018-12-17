export default function interpretNodeArray (nodes, scope, prevCont, prevErrCont) {

  var results = [ ]
  var i = 0;

  (function interpretNextNode () {
    if (i <= nodes.length - 1) {
      
      var node = nodes[i++] 
      if (node === null) {

        results.push(null)
        return interpretNextNode()

      } else if (node.type == 'EmptyStatement') {
        
        return interpretNextNode() 

      } else if (node) {

        return node.interpret(scope, nextCont, nextErrCont) 

        function nextCont (result) {
          results.push(result); 
          return interpretNextNode();
        } 

        function nextErrCont (errorType, value) {
          var extra = results[ results.length - 1 ]
          return prevErrCont.call(null, errorType, value, extra) 
        } 

      }

    } else {

      return prevCont(results) 

    }

  })()

}
