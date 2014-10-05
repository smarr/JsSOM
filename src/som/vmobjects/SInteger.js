'use strict';

function SInteger(intVal) {
    SAbstractObject.call(this);

    this.getEmbeddedInteger = function () {
        return intVal;
    };

    this.getClass = function () {
        return som.integerClass;
    };
}
SInteger.prototype = Object.create(SAbstractObject.prototype);
