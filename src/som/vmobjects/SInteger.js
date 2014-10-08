function isInIntRange(val) {
    return val >= -2147483647 && val <= 2147483647;
}

function intOrBigInt(val) {
    if (isInIntRange(val)) {
        return universe.newInteger(val | 0);
    } else {
        return universe.newBiginteger(bigInt(val));
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
            result = bigInt(intVal).lesser(right.getEmbeddedBigInteger());
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
            return universe.newBiginteger(
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
            return universe.newBiginteger(
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
            return universe.newBiginteger(
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
            var result = bigInt(intVal).divide(right.getEmbeddedBigInteger());
            return universe.newBiginteger(result);
        } else if (right instanceof SDouble) {
            return toDouble(intVal).primIntDiv(right);
        } else {
            var result = Math.floor(intVal / right.getEmbeddedInteger());
            return universe.newInteger(result);
        }
    };

    this.primModulo = function (right) {
        if (right instanceof SBigInteger) {
            var result = bigInt(intVal).mod(right.getEmbeddedBigInteger());
            return universe.newBiginteger(result);
        } else if (right instanceof SDouble) {
            return toDouble(intVal).primModulo(right);
        } else {
            var r = right.getEmbeddedInteger();
            var result = Math.floor(intVal % r);
            if (intVal > 0 && r < 0) {
                result += r;
            }
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
            result = bigInt(intVal).equals(right.getEmbeddedBigInteger());
        } else if (right instanceof SDouble) {
            result = intVal == right.getEmbeddedDouble();
        } else if (right instanceof SInteger) {
            result = intVal == right.getEmbeddedInteger();
        } else {
            result = false;
        }
        return (result) ? som.trueObject : som.falseObject;
    };
}
SInteger.prototype = Object.create(SAbstractObject.prototype);
