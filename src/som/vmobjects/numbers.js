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

        this.getEmbeddedInteger = function () {
            return intVal;
        };

        this.getClass = function () {
            return u.integerClass;
        };

        function toDouble() {
            return u.universe.newDouble(intVal); // JS numbers are always doubles...
        }

        this.primLessThan = function (right) {
            var result;
            if (right instanceof SBigInteger) {
                result = intVal < right.getEmbeddedBigInteger();
            } else if (right instanceof SDouble) {
                return toDouble.primLessThan(right);
            } else {
                result = intVal < right.getEmbeddedInteger();
            }
            return (result) ? u.trueObject : u.falseObject;
        };

        this.primAsString = function () {
            return u.universe.newString(intVal.toString());
        };

        this.primAdd = function (right) {
            if (right instanceof SBigInteger) {
                return intOrBigInt(
                    right.getEmbeddedBigInteger() + BigInt(intVal), u.universe);
            } else if (right instanceof SDouble) {
                return toDouble().primAdd(right);
            } else {
                const r = right.getEmbeddedInteger();
                return intOrBigInt(intVal + r, u.universe);
            }
        };

        this.primSubtract = function (right) {
            if (right instanceof SBigInteger) {
                return intOrBigInt(
                    BigInt(intVal) - right.getEmbeddedBigInteger(), u.universe);
            } else if (right instanceof SDouble) {
                return toDouble().primSubtract(right);
            } else {
                const r = right.getEmbeddedInteger();
                return intOrBigInt(intVal - r, u.universe);
            }
        };

        this.primMultiply = function (right) {
            if (right instanceof SBigInteger) {
                return intOrBigInt(
                    right.getEmbeddedBigInteger().multiply(intVal), u.universe);
            } else if (right instanceof SDouble) {
                return toDouble().primMultiply(right);
            } else {
                var r = right.getEmbeddedInteger();
                return intOrBigInt(intVal * r, u.universe);
            }
        };

        this.primDoubleDiv = function (right) {
            var result;
            if (right instanceof SBigInteger) {
                result = intVal / Number(right.getEmbeddedBigInteger());
            } else if (right instanceof SDouble) {
                result = intVal / right.getEmbeddedDouble();
            } else {
                result = intVal / right.getEmbeddedInteger();
            }
            return u.universe.newDouble(result);
        };

        this.primIntDiv = function (right) {
            if (right instanceof SBigInteger) {
                var result = BigInt(intVal).divide(right.getEmbeddedBigInteger());
                return u.universe.newBigInteger(result);
            } else if (right instanceof SDouble) {
                return toDouble(intVal).primIntDiv(right);
            } else {
                var result = Math.floor(intVal / right.getEmbeddedInteger());
                return u.universe.newInteger(result);
            }
        };

        this.primModulo = function (right) {
            if (right instanceof SBigInteger) {
                var result = BigInt(intVal).mod(right.getEmbeddedBigInteger());
                return u.universe.newBigInteger(result);
            } else if (right instanceof SDouble) {
                return toDouble(intVal).primModulo(right);
            } else {
                var r = right.getEmbeddedInteger();
                // Java has Math.floorMod, JavaScript can use this
                // but it is likely to be very inefficient
                var result = Math.floor(((intVal % r) + r) % r);
                return u.universe.newInteger(result);
            }
        };

        this.primAnd = function (right) {
            if (right instanceof SInteger) {
                return u.universe.newInteger(intVal & right.getEmbeddedInteger());
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
            return (result) ? u.trueObject : u.falseObject;
        };

        this.prim32BitUnsignedValue = function () {
            var arr = new Uint32Array(1);
            arr[0] = intVal;
            return intOrBigInt(arr[0], u.universe);
        };

        this.prim32BitSignedValue = function () {
            return u.universe.newInteger(intVal | 0);
        };
    }
}

class SDouble extends SAbstractObject {
    constructor(doubleVal) {
        super();

        this.getEmbeddedDouble = function () {
            return doubleVal;
        };

        this.getClass = function () {
            return u.doubleClass;
        };

        function asFloat(obj) {
            if (obj instanceof SDouble) {
                return obj.getEmbeddedDouble();
            } else if (obj instanceof SInteger) {
                return obj.getEmbeddedInteger();
            }
            throw new RuntimeException("Cannot coerce " + obj + " to Double!");
        }

        this.primMultiply = function (right) {
            return u.universe.newDouble(doubleVal * asFloat(right));
        };

        this.primAdd = function (right) {
            return u.universe.newDouble(doubleVal + asFloat(right));
        };

        this.primAsInteger = function () {
            var val = doubleVal > 0 ? Math.floor(doubleVal) : Math.ceil(doubleVal);
            return u.universe.newInteger(val);
        };

        this.primAsString = function () {
            return u.universe.newString(doubleVal.toString());
        };

        this.primSubtract = function (right) {
            return u.universe.newDouble(doubleVal - asFloat(right));
        };

        this.primDoubleDiv = function (right) {
            return u.universe.newDouble(doubleVal / asFloat(right));
        };

        this.primIntDiv = function (right) {
            return u.universe.newInteger(Math.floor(doubleVal / asFloat(right)));
        };

        this.primModulo = function (right) {
            return u.universe.newDouble(doubleVal % asFloat(right));
        };

        this.primEquals = function (right) {
            return (doubleVal == asFloat(right)) ? u.trueObject : u.falseObject;
        };

        this.primLessThan = function (right) {
            return (doubleVal < asFloat(right)) ? u.trueObject : u.falseObject;
        };
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
