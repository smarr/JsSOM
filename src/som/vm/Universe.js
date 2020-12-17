/*
* Copyright (c) 2014 Stefan Marr, mail@stefan-marr.de
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/
const assert = require('../../lib/assert').assert;
const IllegalStateException = require('../../lib/exceptions').IllegalStateException;

const platform = require('../../lib/platform');

const Shell = require('./Shell').Shell;

const compiler = require('../compiler/SourcecodeCompiler');

const SObject = require('../vmobjects/SObject').SObject;
const SBlock = require('../vmobjects/SBlock').SBlock;
const SArray = require('../vmobjects/SArray').SArray;
const SClass = require('../vmobjects/SClass').SClass;
const SString = require('../vmobjects/SString').SString;
const SSymbol = require('../vmobjects/SSymbol').SSymbol;
const SPrimitive = require('../vmobjects/SInvokable').SPrimitive;
const SMethod = require('../vmobjects/SInvokable').SMethod;
const numbers = require('../vmobjects/numbers');
const SInteger = numbers.SInteger;
const SBigInteger = numbers.SBigInteger;
const SDouble = numbers.SDouble;

const getBlockEvaluationPrimitive = require('../vmobjects/SBlock').getBlockEvaluationPrimitive;

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
    systemClass.getClass().setClass(exports.metaclassClass);

    // Return the freshly allocated system class
    return systemClass;
};

exports.nilObject      = new SObject(null, 0);
exports.metaclassClass = newMetaclassClass();
exports.objectClass    = newSystemClass();
exports.nilClass       = newSystemClass();
exports.classClass     = newSystemClass();
exports.arrayClass     = newSystemClass();
exports.symbolClass    = newSystemClass();
exports.methodClass    = newSystemClass();
exports.integerClass   = newSystemClass();
exports.primitiveClass = newSystemClass();
exports.stringClass    = newSystemClass();
exports.doubleClass    = newSystemClass();
exports.booleanClass   = newSystemClass();
exports.trueClass      = newSystemClass();
exports.falseClass     = newSystemClass();
exports.blockClasses   = [];
exports.trueObject     = null;
exports.falseObject    = null;
exports.systemObject   = null;
// exports.core_lib       = loadCoreLib();
exports.startTime      = platform.getMillisecondTicks();

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
        lastExitCode  = 0,
        _this = this;

    this.setAvoidExit = function (bool) {
        avoidExit = bool;
    };

    function getDefaultClassPath() {
        if (platform.isBrowser) {
            return ['core-lib/Smalltalk', 'core-lib/Examples', 'core-lib/TestSuite'];
        }
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
            _this.errorPrintln("Class with . in its name?");
            _this.exit(1);
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
                _this.setupClassPath(args[i + 1]);
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
                classPath.unshift(split[0]);
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
        assert(typeof string == 'string' || string instanceof String);
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
            systemClass.getClass().setSuperClass(exports.classClass);
        }

        // Initialize the array of instance fields
        systemClass.setInstanceFields(new SArray(0));
        systemClass.getClass().setInstanceFields(new SArray(0));

        // Initialize the array of instance invokables
        systemClass.setInstanceInvokables(new SArray(0));
        systemClass.getClass().setInstanceInvokables(new SArray(0));

        // Initialize the name of the system class
        systemClass.setName(_this.symbolFor(name));
        systemClass.getClass().setName(_this.symbolFor(name + " class"));

        // Insert the system class into the dictionary of globals
        _this.setGlobal(systemClass.getName(), systemClass);
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
        var name = _this.symbolFor("Block" + numberOfArguments);
        assert(_this.getGlobal(name) == null);

        // Get the block class for blocks with the given number of arguments
        var result = _this.loadClass(name, null);

        // Add the appropriate value primitive to the block class
        var prim = getBlockEvaluationPrimitive(numberOfArguments, result);
        result.addInstancePrimitive(prim);

        // Insert the block class into the dictionary of globals
        _this.setGlobal(name, result);

        exports.blockClasses[numberOfArguments] = result;
    }

    this.loadClass = function (name) {
        // Check if the requested class is already in the dictionary of globals
        var result = _this.getGlobal(name);
        if (result != null) { return result; }

        result = _this.loadClassFor(name, null);

        loadPrimitives(result, false);

        _this.setGlobal(name, result);
        return result;
    };

    this.loadClassFor = function(name, systemClass) {
        // Try loading the class from all different paths
        for (var i = 0; i < classPath.length; i++) {
            var cpEntry = classPath[i];

            // Load the class from a file and return the loaded class
            var result = compiler.compileClassFile(cpEntry, name.getString(), // TODO: how to arrange the global/static namespace of SOM??
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
        var result = _this.loadClassFor(systemClass.getName(), systemClass);

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
        exports.nilObject.setClass(exports.nilClass);

        // Initialize the system classes.
        initializeSystemClass(exports.objectClass,               null,  "Object");
        initializeSystemClass(exports.classClass,     exports.objectClass,  "Class");
        initializeSystemClass(exports.metaclassClass, exports.classClass,   "Metaclass");
        initializeSystemClass(exports.nilClass,       exports.objectClass,  "Nil");
        initializeSystemClass(exports.arrayClass,     exports.objectClass,  "Array");
        initializeSystemClass(exports.methodClass,    exports.objectClass,  "Method");
        initializeSystemClass(exports.integerClass,   exports.objectClass,  "Integer");
        initializeSystemClass(exports.primitiveClass, exports.objectClass,  "Primitive");
        initializeSystemClass(exports.stringClass,    exports.objectClass,  "String");
        initializeSystemClass(exports.symbolClass,    exports.stringClass,  "Symbol");
        initializeSystemClass(exports.doubleClass,    exports.objectClass,  "Double");
        initializeSystemClass(exports.booleanClass,   exports.objectClass,  "Boolean");
        initializeSystemClass(exports.trueClass,      exports.booleanClass, "True");
        initializeSystemClass(exports.falseClass,     exports.booleanClass, "False");

        // Load methods and fields into the system classes
        loadSystemClass(exports.objectClass);
        loadSystemClass(exports.classClass);
        loadSystemClass(exports.metaclassClass);
        loadSystemClass(exports.nilClass);
        loadSystemClass(exports.arrayClass);
        loadSystemClass(exports.methodClass);
        loadSystemClass(exports.symbolClass);
        loadSystemClass(exports.integerClass);
        loadSystemClass(exports.primitiveClass);
        loadSystemClass(exports.stringClass);
        loadSystemClass(exports.doubleClass);
        loadSystemClass(exports.booleanClass);
        loadSystemClass(exports.trueClass);
        loadSystemClass(exports.falseClass);

        // Load the generic block class
        exports.blockClasses[0] = _this.loadClass(_this.symbolFor("Block"));

        // Setup the true and false objects
        exports.trueObject  = _this.newInstance(exports.trueClass);
        exports.falseObject = _this.newInstance(exports.falseClass);

        // Load the system class and create an instance of it
        exports.systemClass  = _this.loadClass(_this.symbolFor("System"));
        exports.systemObject = _this.newInstance(exports.systemClass);

        // Put special objects into the dictionary of globals
        _this.setGlobal(_this.symbolFor("nil"),    exports.nilObject);
        _this.setGlobal(_this.symbolFor("true"),   exports.trueObject);
        _this.setGlobal(_this.symbolFor("false"),  exports.falseObject);
        _this.setGlobal(_this.symbolFor("system"), exports.systemObject);

        // Load the remaining block classes
        loadBlockClass(1);
        loadBlockClass(2);
        loadBlockClass(3);

        objectSystemInitialized = true;
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
        var initialize = exports.systemClass.
            lookupInvokable(_this.symbolFor("initialize:"));
        var somArgs = _this.newArrayWithStrings(args);

        return initialize.invoke(null, [exports.systemObject, somArgs]);
    }

    this.initializeForStandardRepl = function () {
        classPath = ['Smalltalk', 'TestSuite', 'Examples', 'Examples/Benchmarks', 'SUnit'];
        initializeObjectSystem();
    };

    this.interpretMethodInClass = function (className, selector) {
        initializeObjectSystem();

        const clazz = _this.loadClass(_this.symbolFor(className));

        // Lookup the initialize invokable on the system class
        const initialize = clazz.getClass().
            lookupInvokable(_this.symbolFor(selector));

        if (initialize === null) {
            throw new Error(`Lookup of ${selector} in ${className} failed. Can't be executed.`)
        }

        try {
            return initialize.invoke(null, [clazz]);
        } catch (e) {
            if (e instanceof ExitException) {
                return;
            } else {
                throw e;
            }
        }
    };

    this.interpret = function (args) {
        // Check for command line switches first
        var remainingArgs = handleArguments(args);

        try {
            initializeObjectSystem();
            return execute(remainingArgs);
        } catch (e) {
            if (e instanceof ExitException) {
                return;
            } else {
                if ('getMessage' in e) {
                    console.error(e.getMessage());
                }
                throw e;
            }
        }
    };

    this.newArrayWithStrings = function (strArr) {
        var arr = _this.newArrayWithLength(strArr.length);
        for (var i = 0; i < strArr.length; i++) {
            arr.setIndexableField(i, _this.newString(strArr[i]));
        }
        return arr;
    };

    this.newArrayFrom = function (array) {
        return new SArray(array.length, array);
    };

    this.newArrayWithLength = function (length) {
        return new SArray(length);
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

    this.newBigInteger = function (BigIntVal) {
        return new SBigInteger(BigIntVal);
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
        _this.errorPrintln("Runtime Error: " + message);
        _this.exit(1);
    };

    this.errorPrint = function (msg) {
        platform.stderr(msg);
    };

    this.errorPrintln = function (msg) {
        platform.stderrnl(msg);
    };

    this.print = function (msg) {
        platform.stdout(msg);
    };

    this.println = function(msg) {
        platform.stdoutnl(msg);
    };

    this.exit = function (errorCode) {
        // Exit from the Java system
        lastExitCode = errorCode;
        if (!avoidExit) {
            platform.exitInterpreter(errorCode);
        }
        throw new ExitException(errorCode);
    };

    this.getLastExitCode = function () {
        return lastExitCode;
    };
}

exports.Universe = Universe;
exports.universe = new Universe();
exports.SArray = SArray;
exports.SObject = SObject;
exports.SString = SString;
exports.SDouble = SDouble;
exports.SInteger = SInteger;
