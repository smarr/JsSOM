'use strict';

function isInIntRange(val) {
    return val >= -2147483647 && val <= 2147483647;
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

    this.primAsString = function () {
        return universe.newString(intVal.toString());
    };
}
SInteger.prototype = Object.create(SAbstractObject.prototype);
