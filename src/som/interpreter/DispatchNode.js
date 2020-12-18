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
const RuntimeException = require('../../lib/exceptions').RuntimeException;

const assert = require('../../lib/assert').assert;

const Node = require('./Node').Node;

const SClass = require('../vmobjects/SClass').SClass;
const SSymbol = require('../vmobjects/SSymbol').SSymbol;

const u = require('../vm/Universe');

class GenericDispatchNode extends Node {
    constructor(selector) {
        super(null);
        this.selector = selector;
    }

    executeDispatch(frame, args) {
        const rcvr = args[0];
        const rcvrClass = rcvr.getClass();

        const method = rcvrClass.lookupInvokable(this.selector);
        if (method !== null) {
            return method.invoke(frame, args);
        } else {
            return rcvr.sendDoesNotUnderstand(this.selector, frame, args);
        }
    }
}

class UninitializedSuperDispatchNode extends Node {
    constructor(selector, holderClass, classSide) {
        super(null);
        assert(holderClass instanceof SSymbol);
        this.selector = selector;
        this.classSide = classSide;
        this.holderClass = holderClass;
    }

    getLookupClass() {
        let clazz = u.universe.getGlobal(this.holderClass);
        if (this.classSide) {
            clazz = clazz.getClass();
        }
        return clazz.getSuperClass();
    }

    executeDispatch(frame, args) {
        const lookupClass = this.getLookupClass();
        return this.replace(new CachedSuperDispatchNode(this.selector, lookupClass)).
            executeDispatch(frame, args);
    }
}

class CachedSuperDispatchNode extends Node {
    constructor(selector, lookupClass) {
        super(null);
        assert(lookupClass instanceof SClass);
        const method = lookupClass.lookupInvokable(selector);

        if (method == null) {
            throw new RuntimeException("Currently #dnu with super sent is not yet implemented. ");
        }
        this.method = method;
    }

    executeDispatch(frame, args) {
        return this.method.invoke(frame, args);
    }
}

exports.GenericDispatchNode = GenericDispatchNode;
exports.UninitializedSuperDispatchNode = UninitializedSuperDispatchNode;
