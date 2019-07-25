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

const Node = require('./Node').Node;

const SClass = require('../vmobjects/SClass').SClass;
const SSymbol = require('../vmobjects/SSymbol').SSymbol;

const u = require('../vm/Universe');

function GenericDispatchNode(selector) {
    Node.call(this, null);

    this.executeDispatch = function (frame, args) {
        var rcvr = args[0];
        var rcvrClass = rcvr.getClass();

        var method = rcvrClass.lookupInvokable(selector);
        if (method != null) {
            return method.invoke(frame, args);
        } else {
            return rcvr.sendDoesNotUnderstand(selector, frame, args);
        }
    };
}
GenericDispatchNode.prototype = Object.create(Node.prototype);

function UninitializedSuperDispatchNode(selector, holderClass, classSide) {
    Node.call(this, null);
    var _this = this;
    assert(holderClass instanceof SSymbol);

    function getLookupClass() {
        var clazz = u.universe.getGlobal(holderClass);
        if (classSide) {
            clazz = clazz.getClass();
        }
        return clazz.getSuperClass();
    }

    this.executeDispatch = function (frame, args) {
        var lookupClass = getLookupClass();
        return _this.replace(new CachedSuperDispatchNode(selector, lookupClass)).
            executeDispatch(frame, args);
    };
}
UninitializedSuperDispatchNode.prototype = Object.create(Node.prototype);

function CachedSuperDispatchNode(selector, lookupClass) {
    Node.call(this, null);
    assert(lookupClass instanceof SClass);
    var method = lookupClass.lookupInvokable(selector);

    if (method == null) {
        throw new RuntimeException("Currently #dnu with super sent is not yet implemented. ");
    }

    this.executeDispatch = function (frame, args) {
        return method.invoke(frame, args);
    };
}
CachedSuperDispatchNode.prototype = Object.create(Node.prototype);

exports.GenericDispatchNode = GenericDispatchNode;
exports.UninitializedSuperDispatchNode = UninitializedSuperDispatchNode;
