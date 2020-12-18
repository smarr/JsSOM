/*
* Copyright (c) 2014-2019 Stefan Marr, mail@stefan-marr.de
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
const notYetImplemented = require('../../lib/assert').notYetImplemented;
const isInIntRange = require('../../lib/platform').isInIntRange;
const intOrBigInt = require('../../lib/platform').intOrBigInt;

const SAbstractObject = require('./SAbstractObject').SAbstractObject;
const u = require('../vm/Universe');

class SInteger extends SAbstractObject {
    constructor(intVal) {
        super();
        assert(isInIntRange(intVal) && Math.floor(intVal) == intVal);
        this.intVal = intVal;
    }

    getEmbeddedInteger() {
        return this.intVal;
    }

    getClass() {
        return u.integerClass;
    }

    toDouble() {
        return u.universe.newDouble(this.intVal); // JS numbers are always doubles...
    }

    primLessThan(right) {
        let result;
        if (right instanceof SBigInteger) {
            result = this.intVal < right.getEmbeddedBigInteger();
        } else if (right instanceof SDouble) {
            return this.toDouble().primLessThan(right);
        } else {
            result = this.intVal < right.getEmbeddedInteger();
        }
        return result ? u.trueObject : u.falseObject;
    }

    primAsString() {
        return u.universe.newString(this.intVal.toString());
    }

    primAdd(right) {
        if (right instanceof SBigInteger) {
            return intOrBigInt(
                right.getEmbeddedBigInteger() + BigInt(this.intVal), u.universe);
        } else if (right instanceof SDouble) {
            return this.toDouble().primAdd(right);
        } else {
            const r = right.getEmbeddedInteger();
            return intOrBigInt(this.intVal + r, u.universe);
        }
    }

    primSubtract(right) {
        if (right instanceof SBigInteger) {
            return intOrBigInt(
                BigInt(this.intVal) - right.getEmbeddedBigInteger(), u.universe);
        } else if (right instanceof SDouble) {
            return this.toDouble().primSubtract(right);
        } else {
            const r = right.getEmbeddedInteger();
            return intOrBigInt(this.intVal - r, u.universe);
        }
    }

    primMultiply(right) {
        if (right instanceof SBigInteger) {
            return intOrBigInt(
                right.getEmbeddedBigInteger().multiply(this.intVal), u.universe);
        } else if (right instanceof SDouble) {
            return this.toDouble().primMultiply(right);
        } else {
            var r = right.getEmbeddedInteger();
            return intOrBigInt(this.intVal * r, u.universe);
        }
    }

    primDoubleDiv(right) {
        let result;
        if (right instanceof SBigInteger) {
            result = this.intVal / Number(right.getEmbeddedBigInteger());
        } else if (right instanceof SDouble) {
            result = this.intVal / right.getEmbeddedDouble();
        } else {
            result = this.intVal / right.getEmbeddedInteger();
        }
        return u.universe.newDouble(result);
    }

    primIntDiv(right) {
        if (right instanceof SBigInteger) {
            var result = BigInt(this.intVal).divide(right.getEmbeddedBigInteger());
            return u.universe.newBigInteger(result);
        } else if (right instanceof SDouble) {
            return this.toDouble().primIntDiv(right);
        } else {
            var result = Math.floor(this.intVal / right.getEmbeddedInteger());
            return u.universe.newInteger(result);
        }
    }

    primModulo(right) {
        if (right instanceof SBigInteger) {
            var result = BigInt(intVal).mod(right.getEmbeddedBigInteger());
            return u.universe.newBigInteger(result);
        } else if (right instanceof SDouble) {
            return this.toDouble().primModulo(right);
        } else {
            var r = right.getEmbeddedInteger();
            // Java has Math.floorMod, JavaScript can use this
            // but it is likely to be very inefficient
            var result = Math.floor(((this.intVal % r) + r) % r);
            return u.universe.newInteger(result);
        }
    }

    primAnd(right) {
        if (right instanceof SInteger) {
            return u.universe.newInteger(this.intVal & right.getEmbeddedInteger());
        }
        notYetImplemented(); // not supported by the library and, not sure what semantics should be
    }

    primEquals(right) {
        let result;
        if (right instanceof SBigInteger) {
            result = BigInt(this.intVal).equals(right.getEmbeddedBigInteger());
        } else if (right instanceof SDouble) {
            result = this.intVal == right.getEmbeddedDouble();
        } else if (right instanceof SInteger) {
            result = this.intVal == right.getEmbeddedInteger();
        } else {
            result = false;
        }
        return (result) ? u.trueObject : u.falseObject;
    }

    prim32BitUnsignedValue() {
        var arr = new Uint32Array(1);
        arr[0] = this.intVal;
        return intOrBigInt(arr[0], u.universe);
    }

    prim32BitSignedValue() {
        return u.universe.newInteger(this.intVal | 0);
    }
}

function asFloat(obj) {
    if (obj instanceof SDouble) {
        return obj.getEmbeddedDouble();
    } else if (obj instanceof SInteger) {
        return obj.getEmbeddedInteger();
    }
    throw new RuntimeException("Cannot coerce " + obj + " to Double!");
}

class SDouble extends SAbstractObject {
    constructor(doubleVal) {
        super();
        this.doubleVal = doubleVal;
    }

    getEmbeddedDouble() {
        return this.doubleVal;
    }

    getClass() {
        return u.doubleClass;
    }

    primMultiply(right) {
        return u.universe.newDouble(this.doubleVal * asFloat(right));
    }

    primAdd(right) {
        return u.universe.newDouble(this.doubleVal + asFloat(right));
    }

    primAsInteger() {
        const val = this.doubleVal > 0 ? Math.floor(this.doubleVal) : Math.ceil(this.doubleVal);
        return u.universe.newInteger(val);
    }

    primAsString() {
        return u.universe.newString(this.doubleVal.toString());
    }

    primSubtract(right) {
        return u.universe.newDouble(this.doubleVal - asFloat(right));
    }

    primDoubleDiv(right) {
        return u.universe.newDouble(this.doubleVal / asFloat(right));
    }

    primIntDiv(right) {
        return u.universe.newInteger(Math.floor(this.doubleVal / asFloat(right)));
    }

    primModulo(right) {
        return u.universe.newDouble(this.doubleVal % asFloat(right));
    }

    primEquals(right) {
        return (this.doubleVal == asFloat(right)) ? u.trueObject : u.falseObject;
    }

    primLessThan(right) {
        return (this.doubleVal < asFloat(right)) ? u.trueObject : u.falseObject;
    }
}

class SBigInteger extends SAbstractObject {
    constructor(bigIntVal) {
        super();
        assert(typeof bigIntVal === "bigint");
        assert(!isInIntRange(bigIntVal));
        this.bigIntVal = bigIntVal;
    }

    getEmbeddedBigInteger() {
        return this.bigIntVal;
    }

    getClass() {
        return u.integerClass;
    }

    primLessThan(right) {
        let result;
        if (right instanceof SDouble) {
            result = Number(this.bigIntVal) < right.getEmbeddedDouble();
        } else if (right instanceof SInteger) {
            result = this.bigIntVal < right.getEmbeddedInteger();
        } else {
            result = this.bigIntVal < right.getEmbeddedBigInteger();
        }
        return (result) ? u.trueObject : u.falseObject;
    }

    primAsString() {
        return u.universe.newString(this.bigIntVal.toString());
    }

    primAdd(right) {
        if (right instanceof SBigInteger) {
            return u.universe.newBigInteger(right.getEmbeddedBigInteger() + this.bigIntVal);
        } else if (right instanceof SDouble) {
            return u.universe.newDouble(Number(this.bigIntVal) + right.getEmbeddedDouble());
        } else {
            return intOrBigInt(this.bigIntVal + BigInt(right.getEmbeddedInteger()), u.universe);
        }
    };

    primSubtract(right) {
        let result;
        if (right instanceof SBigInteger) {
            result = this.bigIntVal - right.getEmbeddedBigInteger();
        } else if (right instanceof SDouble) {
            return u.universe.newDouble(Number(this.bigIntVal) - right.getEmbeddedDouble());
        } else {
            result = this.bigIntVal - BigInt(right.getEmbeddedInteger());
        }
        return u.universe.newBigInteger(result);
    }

    primMultiply(right) {
        let result;
        if (right instanceof SBigInteger) {
            result = this.bigIntVal * right.getEmbeddedBigInteger();
        } else if (right instanceof SDouble) {
            return u.universe.newDouble(Number(this.bigIntVal) * right.getEmbeddedDouble());
        } else {
            result = this.bigIntVal * right.getEmbeddedInteger();
        }
        return u.universe.newBigInteger(result);
    }

    primDoubleDiv(right) {
        let result;
        const doubleVal = Number(this.bigIntVal);
        if (right instanceof SBigInteger) {
            result = doubleVal / Number(right.getEmbeddedBigInteger());
        } else if (right instanceof SDouble) {
            result = doubleVal / right.getEmbeddedDouble();
        } else {
            result = doubleVal / right.getEmbeddedInteger();
        }
        return u.universe.newDouble(result);
    }

    primIntDiv(right) {
        let result;
        if (right instanceof SBigInteger) {
            result = this.bigIntVal / right.getEmbeddedBigInteger();
        } else if (right instanceof SDouble) {
            return u.universe.newDouble(Number(this.bigIntVal)).primIntDiv(right);
        } else {
            result = this.bigIntVal / right.getEmbeddedInteger();
        }
        return u.universe.newBigInteger(result);
    }

    primModulo(right) {
        let result;
        if (right instanceof SBigInteger) {
            result = this.bigIntVal % right.getEmbeddedBigInteger();
        } else if (right instanceof SDouble) {
            return u.universe.newDouble(Number(this.bigIntVal)).primModulo(right);
        } else {
            result = this.bigIntVal % right.getEmbeddedInteger();
        }
        return u.universe.newBigInteger(result);
    }

    primAnd(right) {
        notYetImplemented(); // not supported by the library and, not sure what semantics should be
    }

    primEquals(right) {
        let result;
        if (right instanceof SBigInteger) {
            result = this.bigIntVal == right.getEmbeddedBigInteger();
        } else if (right instanceof SDouble) {
            result = Number(this.bigIntVal) == right.getEmbeddedDouble();
        } else if (right instanceof SInteger) {
            result = this.bigIntVal == right.getEmbeddedInteger();
        } else {
            result = false;
        }
        return (result) ? u.trueObject : u.falseObject;
    }

    prim32BitUnsignedValue() {
        return intOrBigInt(BigInt.asUintN(32, this.bigIntVal), u.universe);
    }

    prim32BitSignedValue() {
        return intOrBigInt(BigInt.asIntN(32, this.bigIntVal), u.universe);
    }
}

exports.SBigInteger = SBigInteger;
exports.SInteger = SInteger;
exports.SDouble = SDouble;

exports.isInIntRange = isInIntRange;
exports.intOrBigInt = intOrBigInt;
