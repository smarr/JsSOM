function SBigInteger(bigintVal) {
    SAbstractObject.call(this);

    this.getEmbeddedBigInteger = function () {
        return bigintVal;
    };

    this.getClass = function () {
        return som.integerClass;
    };

    this.primLessThan = function (right) {
        var result;
        if (right instanceof SDouble) {
            result = bigintVal.toJSNumber() < right;
        } else if (right instanceof SInteger) {
            result = bigintVal.lesser(right.getEmbeddedInteger());
        } else {
            result = bigintVal.lesser(right.getEmbeddedBigInteger());
        }
        return (result) ? som.trueObject : som.falseObject;
    };

    this.primAsString = function () {
        return universe.newString(bigintVal.toString());
    };

    this.primAdd = function (right) {
        if (right instanceof SBigInteger) {
            return universe.newBiginteger(right.getEmbeddedBigInteger().add(bigintVal));
        } else if (right instanceof SDouble) {
            return universe.newDouble(bigintVal.toJSNumber() + right.getEmbeddedDouble());
        } else {
            return universe.newBiginteger(bigintVal.add(right.getEmbeddedInteger()))
        }
    };

    this.primSubtract = function (right) {
        var result;
        if (right instanceof SBigInteger) {
            result = bigintVal.subtract(right.getEmbeddedBigInteger());
        } else if (right instanceof SDouble) {
            return universe.newDouble(bigintVal.toJSNumber() - right.getEmbeddedDouble());
        } else {
            result = bigintVal.subtract(right.getEmbeddedInteger())
        }
        return universe.newBiginteger(result);
    };

    this.primMultiply = function (right) {
        var result;
        if (right instanceof SBigInteger) {
            result = bigintVal.multiply(right.getEmbeddedBigInteger());
        } else if (right instanceof SDouble) {
            return universe.newDouble(bigintVal.toJSNumber() * right.getEmbeddedDouble());
        } else {
            result = bigintVal.multiply(right.getEmbeddedInteger())
        }
        return universe.newBiginteger(result);
    };

    this.primDoubleDiv = function (right) {
        var result;
        if (right instanceof SBigInteger) {
            result = bigintVal.toJSNumber() / right.getEmbeddedBigInteger().toJSNumber();
        } else if (right instanceof SDouble) {
            result = bigintVal.toJSNumber() / right.getEmbeddedDouble();
        } else {
            result = bigintVal.toJSNumber() / right.getEmbeddedInteger();
        }
        return  universe.newDouble(result);
    };

    this.primIntDiv = function (right) {
        var result;
        if (right instanceof SBigInteger) {
            result = bigintVal.divide(right.getEmbeddedBigInteger());
        } else if (right instanceof SDouble) {
            return universe.newDouble(bigintVal.toJSNumber()).primIntDiv(right);
        } else {
            result = bigintVal.divide(right.getEmbeddedInteger());
        }
        return universe.newBiginteger(result);
    };

    this.primModulo = function (right) {
        var result;
        if (right instanceof SBigInteger) {
            result = bigintVal.mod(right.getEmbeddedBigInteger());
        } else if (right instanceof SDouble) {
            return universe.newDouble(bigintVal.toJSNumber()).primModulo(right);
        } else {
            result = bigintVal.mod(right.getEmbeddedInteger());
        }
        return universe.newBiginteger(result);
    };

    this.primAnd = function (right) {
        notYetImplemented(); // not supported by the library and, not sure what semantics should be
    };

    this.primEquals = function (right) {
        var result;
        if (right instanceof SBigInteger) {
            result = bigintVal.equals(right.getEmbeddedBigInteger());
        } else if (right instanceof SDouble) {
            result = bigintVal.toJSNumber() == right.getEmbeddedDouble();
        } else if (right instanceof SInteger) {
            result = bigintVal.equals(right.getEmbeddedInteger());
        } else {
            result = false;
        }
        return (result) ? som.trueObject : som.falseObject;
    };
}
SBigInteger.prototype = Object.create(SAbstractObject.prototype);
