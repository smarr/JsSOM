'use strict';

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
