'use strict';

function SDouble(doubleVal) {
    SAbstractObject.call(this);

    this.getEmbeddedDouble = function () {
        return doubleVal;
    };

    this.getClass = function () {
        return som.doubleClass;
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
        return universe.newDouble(doubleVal * asFloat(right));
    };

    this.primAdd = function (right) {
        return universe.newDouble(doubleVal + asFloat(right));
    };

    this.primAsString = function () {
        return universe.newString(doubleVal.toString());
    };

    this.primSubtract = function (right) {
        return universe.newDouble(doubleVal - asFloat(right))
    };

    this.primDoubleDiv = function (right) {
        return universe.newDouble(doubleVal / asFloat(right));
    };

    this.primIntDiv = function (right) {
        return universe.newInteger(Math.floor(doubleVal / asFloat(right)));
    };

    this.primModulo = function (right) {
        return universe.newDouble(doubleVal % asFloat(right));
    };

    this.primEquals = function (right) {
        return (doubleVal == asFloat(right)) ? som.trueObject : som.falseObject;
    };

    this.primLessThan = function (right) {
        return (doubleVal < asFloat(right)) ? som.trueObject : som.falseObject;
    }
}
SDouble.prototype = Object.create(SAbstractObject.prototype);
