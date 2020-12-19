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
const u = require('../vm/Universe');
const Primitives = require('./Primitives').Primitives;

function _at(frame, args) {
    var i = args[1];
    return args[0].getIndexableField(i.getEmbeddedInteger() - 1);
}

function _atPut(frame, args) {
    var value = args[2];
    var index = args[1];

    args[0].setIndexableField(index.getEmbeddedInteger() - 1, value);
    return value;
}

function _length(frame, args) {
    return u.universe.newInteger(
        args[0].getNumberOfIndexableFields());
}

function _new(frame, args) {
    var length = args[1];
    return u.universe.newArrayWithLength(length.getEmbeddedInteger())
}

function _doIndexes(frame, args) {
    var block = args[1];
    var blockMethod = block.getMethod();

    var length = args[0].getNumberOfIndexableFields();
    for (var i = 1; i <= length; i++) {  // i is propagated to Smalltalk, so, start with 1
        blockMethod.invoke(frame, [block, u.universe.newInteger(i)]);
    }
    return args[0];
}

function _do(frame, args) {
    var block = args[1];
    var blockMethod = block.getMethod();


    var length = args[0].getNumberOfIndexableFields();
    for (var i = 0; i < length; i++) { // array is zero indexed
        blockMethod.invoke(frame, [block, args[0].getIndexableField(i)]);
    }
    return args[0];
}

class ArrayPrimitives extends Primitives {
    constructor() {
        super();
    }

    installPrimitives() {
        this.installInstancePrimitive("at:", _at);
        this.installInstancePrimitive("at:put:", _atPut);
        this.installInstancePrimitive("length", _length);
        this.installInstancePrimitive("doIndexes:", _doIndexes);
        this.installInstancePrimitive("do:", _do);

        this.installClassPrimitive("new:", _new);
    }
}

exports.prims = ArrayPrimitives;
