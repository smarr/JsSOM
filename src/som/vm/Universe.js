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
//@ts-check
"use strict";
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

function newMetaclassClass() {
    // Allocate the metaclass classes
    var result = new SClass(null, 0);
    result.setClass(new SClass(null, 0));

    // Setup the metaclass hierarchy
    result.getClass().setClass(result);
    return result;
}

function newSystemClass() {
    // Allocate the new system class
    var systemClass = new SClass(null, 0);

    // Setup the metaclass hierarchy
    systemClass.setClass(new SClass(null, 0));
    systemClass.getClass().setClass(exports.metaclassClass);

    // Return the freshly allocated system class
    return systemClass;
}

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

class Association {
    constructor(keySymbol, valueObj) {
        this.key = keySymbol;
        this.value = valueObj;
    }

    getKey() { return this.key; };
    getValue() { return this.value; };
    setValue(v) { this.value = v; };
}

class ExitException {
    constructor(exitCode) {
        this.exitCode = exitCode;
    }

    getExitCode() { return this.exitCode; };
}

function printUsageAndExit() {
    // TODO
}

function getDefaultClassPath() {
    if (platform.isBrowser) {
        return ['core-lib/Smalltalk', 'core-lib/Examples', 'core-lib/TestSuite'];
    }
    return ['.'];
}

const pathSeparator = ":";

class Universe {
    constructor() {
        this.avoidExit     = false;
        this.classPath     = null;
        this.globals       = {};
        this.objectSystemInitialized = false;

        this.printAST      = false;
        this.symbolTable   = {};
        this.lastExitCode  = 0;
    }

    setAvoidExit(bool) {
        this.avoidExit = bool;
    }

    setupClassPath(cp) {
        const tokens = cp.split(pathSeparator);
        this.classPath = getDefaultClassPath();
        this.classPath = this.classPath.concat(tokens);
    }


    // take argument of the form "../foo/Test.som" and return
    // "../foo", "Test", "som"
    getPathClassExt(str) {
        const pathElements = str.split('/'),
            fileName     = pathElements.pop(),
            parentPath   = pathElements.join('/'),
            nameParts    = fileName.split('.');

        if (nameParts.length > 2) {
            this.errorPrintln("Class with . in its name?");
            this.exit(1);
        }

        return [(parentPath === null) ? "" : parentPath,
                nameParts[0],
                nameParts.length > 1 ? nameParts[1] : ""];
    }

    handleArguments(args) {
        var gotClasspath = false,
            remainingArgs = [];

        for (var i = 0; i < args.length; i++) {
            if (args[i] == "-cp") {
                if (i + 1 >= args.length) {
                    printUsageAndExit();
                }
                this.setupClassPath(args[i + 1]);
                ++i; // skip class path
                gotClasspath = true;
            } else if (args[i] == "-d") {
                this.printAST = true;
            } else {
                remainingArgs.push(args[i]);
            }
        }

        if (!gotClasspath) {
            // Get the default class path of the appropriate size
            this.classPath = getDefaultClassPath();
        }

        // check remaining args for class paths, and strip file extension
        for (var i = 0; i < remainingArgs.length; i++) {
            var split = this.getPathClassExt(remainingArgs[i]);

            if ("" != split[0]) { // there was a path
                this.classPath.unshift(split[0]);
            }
            remainingArgs[i] = split[1];
        }

        return remainingArgs;
    }

    newSymbol(string) {
        var result = new SSymbol(string);
        this.symbolTable[string] = result;
        return result;
    }

    symbolFor(string) {
        assert(typeof string == 'string' || string instanceof String);
        // Lookup the symbol in the symbol table
        var result = this.symbolTable[string];
        if (result != null) { return result; }

        return this.newSymbol(string);
    }

    initializeSystemClass(systemClass, superClass, name) {
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
        systemClass.setName(this.symbolFor(name));
        systemClass.getClass().setName(this.symbolFor(name + " class"));

        // Insert the system class into the dictionary of globals
        this.setGlobal(systemClass.getName(), systemClass);
    }

    loadPrimitives(result, isSystemClass) {
        if (result == null) { return; }

        // Load primitives if class defines them, or try to load optional
        // primitives defined for system classes.
        if (result.hasPrimitives() || isSystemClass) {
            result.loadPrimitives(!isSystemClass);
        }
    }

    loadBlockClass(numberOfArguments) {
        // Compute the name of the block class with the given number of arguments
        var name = this.symbolFor("Block" + numberOfArguments);
        assert(this.getGlobal(name) == null);

        // Get the block class for blocks with the given number of arguments
        var result = this.loadClass(name, null);

        // Add the appropriate value primitive to the block class
        var prim = getBlockEvaluationPrimitive(numberOfArguments, result);
        result.addInstancePrimitive(prim);

        // Insert the block class into the dictionary of globals
        this.setGlobal(name, result);

        exports.blockClasses[numberOfArguments] = result;
    }

    loadClass(name) {
        // Check if the requested class is already in the dictionary of globals
        var result = this.getGlobal(name);
        if (result != null) { return result; }

        result = this.loadClassFor(name, null);

        this.loadPrimitives(result, false);

        this.setGlobal(name, result);
        return result;
    }

    loadClassFor(name, systemClass) {
        // Try loading the class from all different paths
        for (var i = 0; i < this.classPath.length; i++) {
            var cpEntry = this.classPath[i];

            // Load the class from a file and return the loaded class
            var result = compiler.compileClassFile(cpEntry, name.getString(), // TODO: how to arrange the global/static namespace of SOM??
                systemClass);
            if (result == null) {
                continue; // continue searching in the class path
            }
            if (this.printAST) {
                dump(result.getClass());  // TODO: how to // TODO: how to arrange the global/static namespace of SOM??
                dump(result);
            }
            return result;
        }
        return null;  // The class could not be found.
    }

    loadSystemClass(systemClass) {
        // Load the system class
        var result = this.loadClassFor(systemClass.getName(), systemClass);

        if (result === null) {
            throw new IllegalStateException(systemClass.getName().getString()
                + " class could not be loaded. "
                + "It is likely that the class path has not been initialized properly. "
                + "Please set system property 'system.class.path' or "
                + "pass the '-cp' command-line parameter.");
        }
        this.loadPrimitives(result, true);
    }

    initializeObjectSystem() {
        if (this.objectSystemInitialized) { return; }

        // Setup the class reference for the nil object
        exports.nilObject.setClass(exports.nilClass);

        // Initialize the system classes.
        this.initializeSystemClass(exports.objectClass,               null,  "Object");
        this.initializeSystemClass(exports.classClass,     exports.objectClass,  "Class");
        this.initializeSystemClass(exports.metaclassClass, exports.classClass,   "Metaclass");
        this.initializeSystemClass(exports.nilClass,       exports.objectClass,  "Nil");
        this.initializeSystemClass(exports.arrayClass,     exports.objectClass,  "Array");
        this.initializeSystemClass(exports.methodClass,    exports.objectClass,  "Method");
        this.initializeSystemClass(exports.integerClass,   exports.objectClass,  "Integer");
        this.initializeSystemClass(exports.primitiveClass, exports.objectClass,  "Primitive");
        this.initializeSystemClass(exports.stringClass,    exports.objectClass,  "String");
        this.initializeSystemClass(exports.symbolClass,    exports.stringClass,  "Symbol");
        this.initializeSystemClass(exports.doubleClass,    exports.objectClass,  "Double");
        this.initializeSystemClass(exports.booleanClass,   exports.objectClass,  "Boolean");
        this.initializeSystemClass(exports.trueClass,      exports.booleanClass, "True");
        this.initializeSystemClass(exports.falseClass,     exports.booleanClass, "False");

        // Load methods and fields into the system classes
        this.loadSystemClass(exports.objectClass);
        this.loadSystemClass(exports.classClass);
        this.loadSystemClass(exports.metaclassClass);
        this.loadSystemClass(exports.nilClass);
        this.loadSystemClass(exports.arrayClass);
        this.loadSystemClass(exports.methodClass);
        this.loadSystemClass(exports.symbolClass);
        this.loadSystemClass(exports.integerClass);
        this.loadSystemClass(exports.primitiveClass);
        this.loadSystemClass(exports.stringClass);
        this.loadSystemClass(exports.doubleClass);
        this.loadSystemClass(exports.booleanClass);
        this.loadSystemClass(exports.trueClass);
        this.loadSystemClass(exports.falseClass);

        // Load the generic block class
        exports.blockClasses[0] = this.loadClass(this.symbolFor("Block"));

        // Setup the true and false objects
        exports.trueObject  = this.newInstance(exports.trueClass);
        exports.falseObject = this.newInstance(exports.falseClass);

        // Load the system class and create an instance of it
        exports.systemClass  = this.loadClass(this.symbolFor("System"));
        exports.systemObject = this.newInstance(exports.systemClass);

        // Put special objects into the dictionary of globals
        this.setGlobal(this.symbolFor("nil"),    exports.nilObject);
        this.setGlobal(this.symbolFor("true"),   exports.trueObject);
        this.setGlobal(this.symbolFor("false"),  exports.falseObject);
        this.setGlobal(this.symbolFor("system"), exports.systemObject);

        // Load the remaining block classes
        this.loadBlockClass(1);
        this.loadBlockClass(2);
        this.loadBlockClass(3);

        this.objectSystemInitialized = true;
    }

    getGlobal(name) {
        var assoc = this.globals[name];
        if (assoc == null) {
            return null;
        }
        return assoc.getValue();
    }

    getGlobalsAssociation(name) {
        return this.globals[name];
    }

    hasGlobal(name) {
        return this.globals[name] != undefined;
    }

    setGlobal(nameSymbol, value) {
        var assoc = this.globals[nameSymbol];
        if (assoc == null) {
            assoc = new Association(nameSymbol, value);
            this.globals[nameSymbol] = assoc;
        } else {
            assoc.setValue(value);
        }
    }

    execute(args) {
        this.initializeObjectSystem();

        // Start the shell if no filename is given
        if (args.length == 0) {
            var shell = new Shell();
            return shell.start();
        }

        // Lookup the initialize invokable on the system class
        const initialize = exports.systemClass.
            lookupInvokable(this.symbolFor("initialize:"));
        const somArgs = this.newArrayWithStrings(args);

        return initialize.invoke(null, [exports.systemObject, somArgs]);
    }

    initializeForStandardRepl() {
        this.classPath = ['Smalltalk', 'TestSuite', 'Examples', 'Examples/Benchmarks', 'SUnit'];
        this.initializeObjectSystem();
    }

    interpretMethodInClass(className, selector) {
        this.initializeObjectSystem();

        const clazz = this.loadClass(this.symbolFor(className));

        // Lookup the initialize invokable on the system class
        const initialize = clazz.getClass().
            lookupInvokable(this.symbolFor(selector));

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
    }

    interpret(args) {
        // Check for command line switches first
        var remainingArgs = this.handleArguments(args);

        try {
            this.initializeObjectSystem();
            return this.execute(remainingArgs);
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
    }

    newArrayWithStrings(strArr) {
        var arr = this.newArrayWithLength(strArr.length);
        for (var i = 0; i < strArr.length; i++) {
            arr.setIndexableField(i, this.newString(strArr[i]));
        }
        return arr;
    }

    newArrayFrom(array) {
        return new SArray(array.length, array);
    }

    newArrayWithLength(length) {
        return new SArray(length);
    }

    newMethod(signature, sourceSection, bodyNode, numberOfTemps) {
        return new SMethod(signature, sourceSection, bodyNode, numberOfTemps);
    }

    newPrimitive(signature, primFun, holder) {
        return new SPrimitive(signature, primFun, holder);
    }

    newString(strValue) {
        return new SString(strValue);
    }

    newInteger(intVal) {
        return new SInteger(intVal);
    }

    newBigInteger(BigIntVal) {
        return new SBigInteger(BigIntVal);
    }

    newBlock(blockMethod, contextFrame) {
        return new SBlock(blockMethod, contextFrame);
    }

    newClass(classClass) {
        return new SClass(classClass);
    }

    newDouble(doubleVal) {
        return new SDouble(doubleVal);
    }

    newInstance(clazz) {
        return new SObject(clazz);
    }

    errorExit(message) {
        this.errorPrintln("Runtime Error: " + message);
        this.exit(1);
    }

    errorPrint(msg) {
        platform.stderr(msg);
    }

    errorPrintln(msg) {
        platform.stderrnl(msg);
    }

    print(msg) {
        platform.stdout(msg);
    }

    println(msg) {
        platform.stdoutnl(msg);
    }

    exit(errorCode) {
        // Exit from the Java system
        this.lastExitCode = errorCode;
        if (!this.avoidExit) {
            platform.exitInterpreter(errorCode);
        }
        throw new ExitException(errorCode);
    }

    getLastExitCode() {
        return this.lastExitCode;
    }
}

exports.Universe = Universe;
exports.universe = new Universe();
exports.SArray = SArray;
exports.SObject = SObject;
exports.SString = SString;
exports.SDouble = SDouble;
exports.SInteger = SInteger;
