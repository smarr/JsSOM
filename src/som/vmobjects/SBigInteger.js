'use strict';

function SBigInteger(bigintVal) {
    SAbstractObject.call(this);

    this.getEmbeddedBigInteger = function () {
        return bigintVal;
    };

    this.getClass = function () {
        return som.integerClass;
    };
}
SBigInteger.prototype = Object.create(SAbstractObject.prototype);
