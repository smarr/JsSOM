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
function IntegerPrimitives() {
    Primitives.call(this);
    var _this = this;

    function _asString(frame, args) {
        return args[0].primAsString();
    }

    function _sqrt(frame, args) {
        var res = Math.sqrt(args[0].getEmbeddedInteger());
        if (res == Math.floor(res)) {
            return universe.newInteger(Math.floor(res));
        } else {
            return universe.newDouble(res);
        }
    }

    function _atRandom(frame, args) {
        return universe.newInteger(Math.floor(args[0].getEmbeddedInteger()
            * Math.random()));
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
        return args[0].primDoubleDiv(args[1]);
    }

    function _intDiv(frame, args) {
        return args[0].primIntDiv(args[1]);
    }

    function _mod(frame, args) {
        return args[0].primModulo(args[1]);
    }

    function _and(frame, args) {
        return args[0].primAnd(args[1]);
    }

    function _equals(frame, args) {
        return args[0].primEquals(args[1]);
    }

    function _equalsEquals(frame, args) {
        return args[0].primEquals(args[1]);
    }

    function _lessThan(frame, args) {
        return args[0].primLessThan(args[1]);
    }

    function _fromString(frame, args) {
        var param = args[1];
        if (!(param instanceof SString)) {
            return som.nilObject;
        }
        var intVal = parseInt(param.getEmbeddedString());
        return universe.newInteger(intVal);
    }

    function _leftShift(frame, args) {
        var rightObj = args[1];
        var left     = args[0];

        var l = left.getEmbeddedInteger();
        var r = rightObj.getEmbeddedInteger();

        var result = l << r;
        if (Math.floor(l) != l || !isInIntRange(result) || !isInIntRange(l * Math.pow(2, r))) {
            var big = BigInt(l);
            big = big * BigInt(Math.pow(2, r));
            return universe.newBigInteger(big);
        }
        return universe.newInteger(result);
    }

    function _bitXor(frame, args) {
        var right = args[1];
        var left  = args[0];
        return universe.newInteger(left.getEmbeddedInteger()
            ^ right.getEmbeddedInteger())
    }

    function _rem(frame, args) {
        var right = args[1];
        var left  = args[0];
        return universe.newInteger(left.getEmbeddedInteger()
            % right.getEmbeddedInteger())
    }

    function _as32BitUnsignedValue(frame, args) {
        return args[0].prim32BitUnsignedValue();
    }

    function _as32BitSignedValue(frame, args) {
        return args[0].prim32BitSignedValue();
    }

    function _unsignedRightShift(frame, args) {
        var right = args[1];
        var left  = args[0];
        return universe.newInteger(
            left.getEmbeddedInteger() >>> right.getEmbeddedInteger());
    }

    this.installPrimitives = function () {
        _this.installInstancePrimitive("asString", _asString);
        _this.installInstancePrimitive("sqrt",     _sqrt);
        _this.installInstancePrimitive("atRandom", _atRandom);
        _this.installInstancePrimitive("+",        _plus);
        _this.installInstancePrimitive("-",        _minus);
        _this.installInstancePrimitive("*",        _mult);
        _this.installInstancePrimitive("//",       _doubleDiv);
        _this.installInstancePrimitive("/",        _intDiv);
        _this.installInstancePrimitive("%",        _mod);
        _this.installInstancePrimitive("&",        _and);
        _this.installInstancePrimitive("=",        _equals);
        _this.installInstancePrimitive("==",       _equalsEquals, true);
        _this.installInstancePrimitive("<",        _lessThan);
        _this.installInstancePrimitive("<<",       _leftShift);
        _this.installInstancePrimitive("bitXor:",  _bitXor);
        _this.installInstancePrimitive("rem:",     _rem);
        _this.installInstancePrimitive(">>>",      _unsignedRightShift);

        _this.installInstancePrimitive("as32BitUnsignedValue", _as32BitUnsignedValue);
        _this.installInstancePrimitive("as32BitSignedValue",   _as32BitSignedValue);

        _this.installClassPrimitive("fromString:", _fromString);
    }
}
IntegerPrimitives.prototype = Object.create(Primitives.prototype);
som.primitives["Integer"] = IntegerPrimitives;
