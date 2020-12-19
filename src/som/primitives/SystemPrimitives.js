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
const Primitives = require('./Primitives').Primitives;
const u = require('../vm/Universe');
const platform = require('../../lib/platform');
const intOrBigInt = require('../vmobjects/numbers').intOrBigInt;

function _load(_frame, args) {
    var symbol = args[1];
    var result = u.universe.loadClass(symbol);
    return (result != null) ? result : u.nilObject;
}

function _exit(_frame, args) {
    var error = args[1];
    return u.universe.exit(error.getEmbeddedInteger());
}

function _global(_frame, args) {
    var symbol = args[1];
    var result = u.universe.getGlobal(symbol);
    return (result != null) ? result : u.nilObject;
}

function _hasGlobal(_frame, args) {
    if (u.universe.hasGlobal(args[1])) {
        return u.trueObject;
    } else {
        return u.falseObject;
    }
}

function _globalPut(_frame, args) {
    var value = args[2];
    var symbol = args[1];
    u.universe.setGlobal(symbol, value);
    return value;
}

function _printString(_frame, args) {
    var str = args[1];
    u.universe.print(str.getEmbeddedString());
    return args[0];
}

function _printNewline(_frame, args) {
    u.universe.println("");
    return args[0];
}

function _time(_frame, _args) {
    var diff = platform.getMillisecondTicks() - u.startTime;
    return intOrBigInt(diff, u.universe);
}

function _ticks(_frame, _args) {
    var diff = platform.getMillisecondTicks() - u.startTime;
    return intOrBigInt(diff * 1000, u.universe);
}

function _fullGC(_frame, _args) {
    /* not general way to do that in JS */
    return u.falseObject;
}

class SystemPrimitives extends Primitives {
    constructor() {
        super();
    }

    installPrimitives() {
        this.installInstancePrimitive("load:", _load);
        this.installInstancePrimitive("exit:", _exit);
        this.installInstancePrimitive("hasGlobal:", _hasGlobal);
        this.installInstancePrimitive("global:", _global);
        this.installInstancePrimitive("global:put:", _globalPut);
        this.installInstancePrimitive("printString:", _printString);
        this.installInstancePrimitive("printNewline", _printNewline);
        this.installInstancePrimitive("time", _time);
        this.installInstancePrimitive("ticks", _ticks);
        this.installInstancePrimitive("fullGC", _fullGC);
    }
}

exports.prims = SystemPrimitives;
