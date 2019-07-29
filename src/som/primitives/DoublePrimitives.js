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
const IllegalStateException = require('../../lib/exceptions').IllegalStateException;

const Primitives = require('./Primitives').Primitives;
const u = require('../vm/Universe');

function DoublePrimitives() {
    Primitives.call(this);
    var _this = this;

    function _coerce_to_double(obj) {
        if (obj instanceof u.SDouble) {
            return obj;
        }
        if (obj instanceof u.SInteger) {
            return u.universe.newDouble(obj.getEmbeddedInteger());
        }
        throw new IllegalStateException("Cannot coerce " + obj.toSource()
            + " to Double!");
    }

    function _asInteger(frame, args) {
        return args[0].primAsInteger();
    }

    function _asString(frame, args) {
        return args[0].primAsString();
    }

    function _sqrt(frame, args) {
        return u.universe.newDouble(
            Math.sqrt(args[0].getEmbeddedDouble()))
    }

    function _plus(frame, args) {
        return args[0].primAdd(args[1]);
    }

    function _minus(frame, args) {
        return args[0].primSubtract(args[1]);
    }

    function _mult(frame, args) {
        return args[0].primMultiply(args[1]);
    }

    function _doubleDiv(frame, args) {
        return args[0].primDoubleDiv(args[1])
    }

    function _mod(frame, args) {
        return args[0].primModulo(args[1])
    }

    function _equals(frame, args) {
        return args[0].primEquals(args[1])
    }

    function _lessThan(frame, args) {
        return args[0].primLessThan(args[1])
    }

    function _round(frame, args) {
        var intVal = Math.round(args[0].getEmbeddedDouble());
        return u.universe.newInteger(intVal);
    }

    function _sin(frame, args) {
        var val = Math.sin(args[0].getEmbeddedDouble());
        return u.universe.newDouble(val);
    }

    function _cos(frame, args) {
        var val = Math.cos(args[0].getEmbeddedDouble());
        return u.universe.newDouble(val);
    }

    function _positiveInfinity(_frame, _args) {
        return u.universe.newDouble(Number.POSITIVE_INFINITY);
    }

    this.installPrimitives = function () {
        _this.installInstancePrimitive("asInteger", _asInteger);
        _this.installInstancePrimitive("asString",  _asString);
        _this.installInstancePrimitive("round",     _round);
        _this.installInstancePrimitive("sqrt",      _sqrt);
        _this.installInstancePrimitive("+",         _plus);
        _this.installInstancePrimitive("-",         _minus);
        _this.installInstancePrimitive("*",         _mult);
        _this.installInstancePrimitive("//",        _doubleDiv);
        _this.installInstancePrimitive("%",         _mod);
        _this.installInstancePrimitive("=",         _equals);
        _this.installInstancePrimitive("<",         _lessThan);
        _this.installInstancePrimitive("sin",       _sin);
        _this.installInstancePrimitive("cos",       _cos);

        _this.installClassPrimitive("PositiveInfinity", _positiveInfinity);
    }
}
DoublePrimitives.prototype = Object.create(Primitives.prototype);
exports.prims = DoublePrimitives;
