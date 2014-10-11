function moveCaretToEnd(el) {
    if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != "undefined") {
        el.focus();
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
}

function handleReplInput(e) {
  if (e.target.value.indexOf("\n") != -1) {
    var input = e.target.value;
    document.getElementById("repl-out").innerHTML += "---> " + input;

    e.target.value = '';
    replInvokeCnt++;
    
    var stmt = "Shell_Class_" + replInvokeCnt++ + " = ( run: it = ( | tmp | tmp := ("
                + input + " ). 'it = ' print. ^tmp println ) )";
    var myClass = compileClassString(stmt, null);
    var myObject = universe.newInstance(myClass);
    var shellMethod = myClass.lookupInvokable(universe.symbolFor("run:"));
    try {
      it = shellMethod.invoke(null, [myObject, it]);
    } catch (e) {
        document.getElementById("repl-out").innerHTML += "Error: " + e.toString();
    }
  }
}

universe.print = function(msg) {
  document.getElementById("repl-out").innerHTML += msg;
};

universe.println = function(msg) {
  document.getElementById("repl-out").innerHTML += msg + "\n";
};

universe.errorPrint = function(msg) {
  document.getElementById("repl-out").innerHTML += "Error" + msg;
};

universe.errorPrintln = function(msg) {
  document.getElementById("repl-out").innerHTML += "Error" + msg + "\n";
};


universe.initializeForStandardRepl();
it = som.nilObject;

moveCaretToEnd(document.getElementById("repl-in"));

replInvokeCnt = 0;
document.getElementById("example-div").style.display = "none";
document.getElementById("repl").style.display = "block";
