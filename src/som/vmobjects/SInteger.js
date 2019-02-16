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
function isInIntRange(val) {
    return val >= -2147483647 && val <= 2147483647;
}

function intOrBigInt(val) {
    if (isInIntRange(val)) {
        return universe.newInteger(val | 0);
    } else {
        return universe.newBigInteger(BigInt(val));
    }
}

function SInteger(intVal) {
    assert(isInIntRange(intVal) && Math.floor(intVal) == intVal);
    SAbstractObject.call(this);

    this.getEmbeddedInteger = function () {
        return intVal;
    };

    this.getClass = function () {
        return som.integerClass;
    };

    function toDouble() {
        return universe.newDouble(intVal); // JS numbers are always doubles...
    }

    this.primLessThan = function (right) {
        var result;
        if (right instanceof SBigInteger) {
            result = BigInt(intVal).lesser(right.getEmbeddedBigInteger());
        } else if (right instanceof SDouble) {
            return toDouble.primLessThan(right);
        } else {
            result = intVal < right.getEmbeddedInteger();
        }
        return (result) ? som.trueObject : som.falseObject;
    };

    this.primAsString = function () {
        return universe.newString(intVal.toString());
    };

    this.primAdd = function (right) {
        if (right instanceof SBigInteger) {
            return universe.newBigInteger(
                right.getEmbeddedBigInteger().add(intVal));
        } else if (right instanceof SDouble) {
            return toDouble().primAdd(right);
        } else {
            var r = right.getEmbeddedInteger();
            return intOrBigInt(intVal + r);
        }
    };

    this.primSubtract = function (right) {
        if (right instanceof SBigInteger) {
            return universe.newBigInteger(
                right.getEmbeddedBigInteger().subtract(intVal));
        } else if (right instanceof SDouble) {
            return toDouble().primSubtract(right);
        } else {
            var r = right.getEmbeddedInteger();
            return intOrBigInt(intVal - r);
        }
    };

    this.primMultiply = function (right) {
        if (right instanceof SBigInteger) {
            return universe.newBigInteger(
                right.getEmbeddedBigInteger().multiply(intVal));
        } else if (right instanceof SDouble) {
            return toDouble().primMultiply(right);
        } else {
            var r = right.getEmbeddedInteger();
            return intOrBigInt(intVal * r);
        }
    };

    this.primDoubleDiv = function (right) {
        var result;
        if (right instanceof SBigInteger) {
            result = intVal / right.getEmbeddedBigInteger().toJSNumber();
        } else if (right instanceof SDouble) {
            result = intVal / right.getEmbeddedDouble();
        } else {
            result = intVal / right.getEmbeddedInteger();
        }
        return universe.newDouble(result);
    };

    this.primIntDiv = function (right) {
        if (right instanceof SBigInteger) {
            var result = BigInt(intVal).divide(right.getEmbeddedBigInteger());
            return universe.newBigInteger(result);
        } else if (right instanceof SDouble) {
            return toDouble(intVal).primIntDiv(right);
        } else {
            var result = Math.floor(intVal / right.getEmbeddedInteger());
            return universe.newInteger(result);
        }
    };

    this.primModulo = function (right) {
        if (right instanceof SBigInteger) {
            var result = BigInt(intVal).mod(right.getEmbeddedBigInteger());
            return universe.newBigInteger(result);
        } else if (right instanceof SDouble) {
            return toDouble(intVal).primModulo(right);
        } else {
            var r = right.getEmbeddedInteger();
            // Java has Math.floorMod, JavaScript can use this
            // but it is likely to be very inefficient
            var result = Math.floor(((intVal % r) + r) % r);
            return universe.newInteger(result);
        }
    };

    this.primAnd = function (right) {
        if (right instanceof SInteger) {
            return universe.newInteger(intVal & right.getEmbeddedInteger());
        }
        notYetImplemented(); // not supported by the library and, not sure what semantics should be
    };

    this.primEquals = function (right) {
        var result;
        if (right instanceof SBigInteger) {
            result = BigInt(intVal).equals(right.getEmbeddedBigInteger());
        } else if (right instanceof SDouble) {
            result = intVal == right.getEmbeddedDouble();
        } else if (right instanceof SInteger) {
            result = intVal == right.getEmbeddedInteger();
        } else {
            result = false;
        }
        return (result) ? som.trueObject : som.falseObject;
    };

    this.prim32BitUnsignedValue = function () {
        var arr = new Uint32Array(1);
        arr[0] = intVal;
        return intOrBigInt(arr[0]);
    }

    this.prim32BitSignedValue = function () {
        return universe.newInteger(intVal | 0);
    }
}
SInteger.prototype = Object.create(SAbstractObject.prototype);
