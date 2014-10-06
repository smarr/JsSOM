'use strict';

var newMetaclassClass = function () {
    // Allocate the metaclass classes
    var result = new SClass(null, 0);
    result.setClass(new SClass(null, 0));

    // Setup the metaclass hierarchy
    result.getClass().setClass(result);
    return result;
};

var newSystemClass = function () {
    // Allocate the new system class
    var systemClass = new SClass(null, 0);

    // Setup the metaclass hierarchy
    systemClass.setClass(new SClass(null, 0));
    systemClass.getClass().setClass(som.metaclassClass);

    // Return the freshly allocated system class
    return systemClass;
};

window.som = {};
window.som.nilObject      = new SObject(null, 0);
window.som.metaclassClass = newMetaclassClass();
window.som.objectClass    = newSystemClass();
window.som.nilClass       = newSystemClass();
window.som.classClass     = newSystemClass();
window.som.arrayClass     = newSystemClass();
window.som.symbolClass    = newSystemClass();
window.som.methodClass    = newSystemClass();
window.som.integerClass   = newSystemClass();
window.som.primitiveClass = newSystemClass();
window.som.stringClass    = newSystemClass();
window.som.doubleClass    = newSystemClass();
window.som.booleanClass   = newSystemClass();
window.som.trueClass      = newSystemClass();
window.som.falseClass     = newSystemClass();
window.som.blockClasses   = [];
window.som.trueObject     = null;
window.som.falseObject    = null;
window.som.systemObject   = null;
window.som.core_lib       = loadCoreLib();
window.som.primitives     = {};

function Association(keySymbol, valueObj) {
    var key   = keySymbol,
        value = valueObj;
    this.getKey   = function ( ) { return key; };
    this.getValue = function ( ) { return value; };
    this.setValue = function (v) { value = v; }
}

function ExitException(exitCode) {
    this.getExitCode = function () { return exitCode; }
}

function Universe() {
    var avoidExit     = false,
        classPath     = null,
        globals       = {},
        objectSystemInitialized = false,
        pathSeparator = ":",
        printAST      = false,
        symbolTable   = {},
        lastExitCode  = 0;

    this.setAvoidExit = function (bool) {
        avoidExit = bool;
    };

    function getDefaultClassPath() {
        return ['.'];
    }

    this.setupClassPath = function (cp) {
        var tokens = cp.split(pathSeparator);
        classPath = getDefaultClassPath();
        classPath = classPath.concat(tokens);
    };

    function printUsageAndExit() {
        // TODO
    }

    // take argument of the form "../foo/Test.som" and return
    // "../foo", "Test", "som"
    function getPathClassExt(str) {
        var pathElements = str.split('/'),
            fileName     = pathElements.pop(),
            parentPath   = pathElements.join('/'),
            nameParts    = fileName.split('.');

        if (nameParts.length > 2) {
            universe.errorPrintln("Class with . in its name?");
            universe.exit(1);
        }

        return [(parentPath === null) ? "" : parentPath,
                nameParts[0],
                nameParts.length > 1 ? nameParts[1] : ""];
    }


    function handleArguments(args) {
        var gotClasspath = false,
            remainingArgs = [];

        for (var i = 0; i < args.length; i++) {
            if (args[i] == "-cp") {
                if (i + 1 >= args.length) {
                    printUsageAndExit();
                }
                universe.setupClassPath(args[i + 1]);
                ++i; // skip class path
                gotClasspath = true;
            } else if (args[i] == "-d") {
                printAST = true;
            } else {
                remainingArgs.push(args[i]);
            }
        }

        if (!gotClasspath) {
            // Get the default class path of the appropriate size
            classPath = getDefaultClassPath();
        }

        // check remaining args for class paths, and strip file extension
        for (var i = 0; i < remainingArgs.length; i++) {
            var split = getPathClassExt(remainingArgs[i]);

            if ("" != split[0]) { // there was a path
                classPath = split[0].concat(classPath);
            }
            remainingArgs[i] = split[1];
        }

        return remainingArgs;
    }

    function newSymbol(string) {
        var result = new SSymbol(string);
        symbolTable[string] = result;
        return result;
    }

    this.symbolFor = function (string) {
        // Lookup the symbol in the symbol table
        var result = symbolTable[string];
        if (result != null) { return result; }

        return newSymbol(string);
    };

    function initializeSystemClass(systemClass, superClass, name) {
        // Initialize the superclass hierarchy
        if (superClass != null) {
            systemClass.setSuperClass(superClass);
            systemClass.getClass().setSuperClass(superClass.getClass());
        } else {
            systemClass.getClass().setSuperClass(som.classClass);
        }

        // Initialize the array of instance fields
        systemClass.setInstanceFields([]);
        systemClass.getClass().setInstanceFields([]);

        // Initialize the array of instance invokables
        systemClass.setInstanceInvokables([]);
        systemClass.getClass().setInstanceInvokables([]);

        // Initialize the name of the system class
        systemClass.setName(universe.symbolFor(name));
        systemClass.getClass().setName(universe.symbolFor(name + " class"));

        // Insert the system class into the dictionary of globals
        universe.setGlobal(systemClass.getName(), systemClass);
    }

    function loadPrimitives(result, isSystemClass) {
        if (result == null) { return; }

        // Load primitives if class defines them, or try to load optional
        // primitives defined for system classes.
        if (result.hasPrimitives() || isSystemClass) {
            result.loadPrimitives(!isSystemClass);
        }
    }

    function loadBlockClass(numberOfArguments) {
        // Compute the name of the block class with the given number of arguments
        var name = universe.symbolFor("Block" + numberOfArguments);
        assert(universe.getGlobal(name) == null);

        // Get the block class for blocks with the given number of arguments
        var result = universe.loadClass(name, null);

        // Add the appropriate value primitive to the block class
        result.addInstancePrimitive(getBlockEvaluationPrimitive(
            numberOfArguments, this, result));

        // Insert the block class into the dictionary of globals
        universe.setGlobal(name, result);

        som.blockClasses[numberOfArguments] = result;
    }

    this.loadClass = function (name) {
        // Check if the requested class is already in the dictionary of globals
        var result = universe.getGlobal(name);
        if (result != null) { return result; }

        result = universe.loadClassFor(name, null);

        loadPrimitives(result, false);

        universe.setGlobal(name, result);
        return result;
    };

    this.loadClassFor = function(name, systemClass) {
        // Try loading the class from all different paths
        for (var i = 0; i < classPath.length; i++) {
            var cpEntry = classPath[i];

            // Load the class from a file and return the loaded class
            var result = compileClassFile(cpEntry, name.getString(), // TODO: how to arrange the global/static namespace of SOM??
                systemClass);
            if (result == null) {
                continue; // continue searching in the class path
            }
            if (printAST) {
                dump(result.getClass());  // TODO: how to // TODO: how to arrange the global/static namespace of SOM??
                dump(result);
            }
            return result;
        }
        return null;  // The class could not be found.
    };

    function loadSystemClass(systemClass) {
        // Load the system class
        var result = universe.loadClassFor(systemClass.getName(), systemClass);

        if (result === null) {
            throw new IllegalStateException(systemClass.getName().getString()
                + " class could not be loaded. "
                + "It is likely that the class path has not been initialized properly. "
                + "Please set system property 'system.class.path' or "
                + "pass the '-cp' command-line parameter.");
        }
        loadPrimitives(result, true);
    }

    function initializeObjectSystem() {
        if (objectSystemInitialized) { return; }

        // Setup the class reference for the nil object
        som.nilObject.setClass(som.nilClass);

        // Initialize the system classes.
        initializeSystemClass(som.objectClass,               null,  "Object");
        initializeSystemClass(som.classClass,     som.objectClass,  "Class");
        initializeSystemClass(som.metaclassClass, som.classClass,   "Metaclass");
        initializeSystemClass(som.nilClass,       som.objectClass,  "Nil");
        initializeSystemClass(som.arrayClass,     som.objectClass,  "Array");
        initializeSystemClass(som.methodClass,    som.objectClass,  "Method");
        initializeSystemClass(som.symbolClass,    som.objectClass,  "Symbol");
        initializeSystemClass(som.integerClass,   som.objectClass,  "Integer");
        initializeSystemClass(som.primitiveClass, som.objectClass,  "Primitive");
        initializeSystemClass(som.stringClass,    som.objectClass,  "String");
        initializeSystemClass(som.doubleClass,    som.objectClass,  "Double");
        initializeSystemClass(som.booleanClass,   som.objectClass,  "Boolean");
        initializeSystemClass(som.trueClass,      som.booleanClass, "True");
        initializeSystemClass(som.falseClass,     som.booleanClass, "False");

        // Load methods and fields into the system classes
        loadSystemClass(som.objectClass);
        loadSystemClass(som.classClass);
        loadSystemClass(som.metaclassClass);
        loadSystemClass(som.nilClass);
        loadSystemClass(som.arrayClass);
        loadSystemClass(som.methodClass);
        loadSystemClass(som.symbolClass);
        loadSystemClass(som.integerClass);
        loadSystemClass(som.primitiveClass);
        loadSystemClass(som.stringClass);
        loadSystemClass(som.doubleClass);
        loadSystemClass(som.booleanClass);
        loadSystemClass(som.trueClass);
        loadSystemClass(som.falseClass);

        // Load the generic block class
        som.blockClasses[0] = universe.loadClass(universe.symbolFor("Block"));

        // Setup the true and false objects
        som.trueObject  = universe.newInstance(som.trueClass);
        som.falseObject = universe.newInstance(som.falseClass);

        // Load the system class and create an instance of it
        som.systemClass  = universe.loadClass(universe.symbolFor("System"));
        som.systemObject = universe.newInstance(som.systemClass);

        // Put special objects into the dictionary of globals
        universe.setGlobal(universe.symbolFor("nil"),    som.nilObject);
        universe.setGlobal(universe.symbolFor("true"),   som.trueObject);
        universe.setGlobal(universe.symbolFor("false"),  som.falseObject);
        universe.setGlobal(universe.symbolFor("system"), som.systemObject);

        // Load the remaining block classes
        loadBlockClass(1);
        loadBlockClass(2);
        loadBlockClass(3);

        objectSystemInitialized = true;
        Object.freeze(window.som);
    }

    this.getGlobal = function (name) {
        var assoc = globals[name];
        if (assoc == null) {
            return null;
        }
        return assoc.getValue();
    };

    this.getGlobalsAssociation = function (name) {
        return globals[name];
    };

    this.hasGlobal = function (name) {
        return globals[name] != undefined;
    };

    this.setGlobal = function (nameSymbol, value) {
        var assoc = globals[nameSymbol];
        if (assoc == null) {
            assoc = new Association(nameSymbol, value);
            globals[nameSymbol] = assoc;
        } else {
            assoc.setValue(value);
        }
    };

    function execute(args) {
        initializeObjectSystem();

        // Start the shell if no filename is given
        if (args.length == 0) {
            var shell = new Shell(this);
            return shell.start();
        }

        // Lookup the initialize invokable on the system class
        var initialize = som.systemClass.
            lookupInvokable(universe.symbolFor("initialize:"));

        return initialize.invoke(null, [som.systemObject, args]);
    }

    this.interpretMethodInClass = function (className, selector) {
        initializeObjectSystem();

        var clazz = universe.loadClass(universe.symbolFor(className));

        // Lookup the initialize invokable on the system class
        var initialize = clazz.getClass().
            lookupInvokable(universe.symbolFor(selector));
        return initialize.invoke(null, [clazz]);
    };

    this.interpret = function (args) {
        initializeObjectSystem();

        // Check for command line switches
        var remainingArgs = handleArguments(args);

        // Initialize the known universe
        return execute(remainingArgs);
    };

    this.newMethod = function (signature, sourceSection, bodyNode, numberOfTemps) {
        return new SMethod(signature, sourceSection, bodyNode, numberOfTemps);
    };

    this.newPrimitive = function (signature, primFun, holder) {
        return new SPrimitive(signature, primFun, holder);
    };

    this.newString = function (strValue) {
        return new SString(strValue);
    };

    this.newInteger = function (intVal) {
        return new SInteger(intVal);
    };

    this.newBiginteger = function (bigIntVal) {
        return new SBigInteger(bigIntVal);
    };

    this.newBlock = function (blockMethod, contextFrame) {
        return new SBlock(blockMethod, contextFrame);
    };

    this.newClass = function (classClass) {
        return new SClass(classClass);
    };

    this.newDouble = function (doubleVal) {
        return new SDouble(doubleVal);
    };

    this.newInstance = function (clazz) {
        return new SObject(clazz);
    };

    this.errorExit = function (message) {
        universe.errorPrintln("Runtime Error: " + message);
        universe.exit(1);
    };

    this.errorPrint = function (msg) {
        document.write("<span style='color:red';>" + msg + "</span>");
    };

    this.errorPrintln = function (msg) {
        document.writeln("<span style='color:red';>" + msg + "</span>");
    };

    this.print = function (msg) {
        document.write(msg);
    };

    this.println = function(msg) {
        document.writeln(msg);
    };

    this.exit = function (errorCode) {
        // Exit from the Java system
        if (!avoidExit) {
            throw new ExitException(errorCode);
        } else {
            lastExitCode = errorCode;
        }
    }
}

window.universe = new Universe();
