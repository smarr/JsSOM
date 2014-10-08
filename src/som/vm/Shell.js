function Shell() {
    this.start = function () {
        var counter = 0;
        var it = som.nilObject;
        universe.println("SOM Shell. Type \"quit\" to exit.\n");
        universe.setAvoidExit(true);
        universe.print("---> ");

        process.stdin.setEncoding('utf8');
        process.stdin.on('readable', function() {
            try {
                // Read a statement from the keyboard
                var stmt = process.stdin.read();
                if (stmt == null) { return; }

                if (stmt == "quit" || stmt == "quit\n") {
                    process.exit(0);
                }

                // Generate a temporary class with a run method
                var stmtClass = "Shell_Class_" + counter++ + " = ( run: it = ( | tmp | tmp := ("
                    + stmt + " ). 'it = ' print. ^tmp println ) )";

                // Compile and load the newly generated class
                var myClass = compileClassString(stmtClass, null);
                if (myClass != null) {
                    var myObject = universe.newInstance(myClass);
                    // Lookup the run: method
                    var shellMethod = myClass.
                        lookupInvokable(universe.symbolFor("run:"));

                    // Invoke the run method
                    it = shellMethod.invoke(null, [myObject, it]);
                    universe.print("---> ");
                }
            } catch (e) {
                universe.errorPrintln("Caught exception: " + e.toString());
            }
        });
    }
}
