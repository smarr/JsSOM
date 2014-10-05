'use strict';

function SDouble(doubleVal) {
    SAbstractObject.call(this);

    this.getEmbeddedDouble = function () {
        return doubleVal;
    };

    this.getClass = function () {
        return som.doubleClass;
    };
}
SDouble.prototype = Object.create(SAbstractObject.prototype);
