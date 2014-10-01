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
    systemClass.getClass().setClass(somMetaclassClass);

    // Return the freshly allocated system class
    return systemClass;
};

window.somNil = new SObject(null, 0);
window.somMetaclassClass = newMetaclassClass();

window.som = {
    objectClass:    newSystemClass(),
    nilClass:       newSystemClass(),
    classClass:     newSystemClass(),
    arrayClass:     newSystemClass(),
    symbolClass:    newSystemClass(),
    methodClass:    newSystemClass(),
    integerClass:   newSystemClass(),
    primitiveClass: newSystemClass(),
    stringClass:    newSystemClass(),
    doubleClass:    newSystemClass(),
    booleanClass:   newSystemClass()
};

function Universe() {
    var avoidExit,
        pathSeparator = ":",
        classPath;

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
            errorPrintln("Class with . in its name?");
            exit(1);
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
                setupClassPath(args[i + 1]);
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

    function initializeObjectSystem() {
        // Allocate the nil object
        som.nilObject = new SObject(null, 0);

        // Setup the class reference for the nil object
        som.nilObject.setClass(som.nilClass);

        // Initialize the system classes.
        initializeSystemClass(som.objectClass,                null, "Object");
        initializeSystemClass(som.classClass,      som.objectClass, "Class");
        initializeSystemClass(somMetaclassClass,   som.classClass,  "Metaclass");
        initializeSystemClass(som.nilClass,        som.objectClass, "Nil");
        initializeSystemClass(som.arrayClass,      som.objectClass, "Array");
        initializeSystemClass(som.methodClass,     som.objectClass, "Method");
        initializeSystemClass(som.symbolClass,     som.objectClass, "Symbol");
        initializeSystemClass(som.integerClass,    som.objectClass, "Integer");
        initializeSystemClass(som.primitiveClass,  som.objectClass, "Primitive");
        initializeSystemClass(som.stringClass,     som.objectClass, "String");
        initializeSystemClass(som.doubleClass,     som.objectClass, "Double");
        initializeSystemClass(som.booleanClass,    som.objectClass, "Boolean");

        trueClass  = newSystemClass();
        falseClass = newSystemClass();

        initializeSystemClass(trueClass,      booleanClass, "True");
        initializeSystemClass(falseClass,     booleanClass, "False");

        // Load methods and fields into the system classes
        loadSystemClass(objectClass);
        loadSystemClass(classClass);
        loadSystemClass(metaclassClass);
        loadSystemClass(nilClass);
        loadSystemClass(arrayClass);
        loadSystemClass(methodClass);
        loadSystemClass(symbolClass);
        loadSystemClass(integerClass);
        loadSystemClass(primitiveClass);
        loadSystemClass(stringClass);
        loadSystemClass(doubleClass);
        loadSystemClass(booleanClass);
        loadSystemClass(trueClass);
        loadSystemClass(falseClass);

        // Load the generic block class
        blockClasses[0] = loadClass(symbolFor("Block"));

        // Setup the true and false objects
        trueObject  = newInstance(trueClass);
        falseObject = newInstance(falseClass);

        // Load the system class and create an instance of it
        systemClass  = loadClass(symbolFor("System"));
        systemObject = newInstance(systemClass);

        // Put special objects into the dictionary of globals
        setGlobal("nil",    nilObject);
        setGlobal("true",   trueObject);
        setGlobal("false",  falseObject);
        setGlobal("system", systemObject);

        // Load the remaining block classes
        loadBlockClass(1);
        loadBlockClass(2);
        loadBlockClass(3);

        if (Globals.trueObject != trueObject) {
            errorExit("Initialization went wrong for class Globals");
        }

        if (Blocks.blockClass1 != blockClasses[1]) {
            errorExit("Initialization went wrong for class Blocks");
        }
        objectSystemInitialized = true;
    }

    function execute(args) {
        initializeObjectSystem();

        // Start the shell if no filename is given
        if (args.length == 0) {
            var shell = new Shell(this);
            return shell.start();
        }

        // Lookup the initialize invokable on the system class
        var initialize = systemClass.
            lookupInvokable(symbolFor("initialize:"));

        return initialize.invoke([systemObject, args]);
    }

    this.interpret = function (args) {
        // Check for command line switches
        var remainingArgs = handleArguments(args);

        // Initialize the known universe
        return execute(remainingArgs);
    }
}

window.universe = new Universe();
