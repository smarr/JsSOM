'use strict';

function Argument(name, index) {
    var _this = this;

    this.toString = function () {
        return "Argument(" + name + ")";
    };

    this.isSelf = function () {
        return "self" == name || "$blockSelf" == name;
    };

    this.getReadNode = function (contextLevel, source) {
        return createArgumentRead(_this, contextLevel, source);
    };

    this.getSuperReadNode = function (contextLevel, holderClass, classSide, source) {
        return createSuperRead(
            _this, contextLevel, holderClass, classSide, source);
    };

    this.getIndex = function () {
        return index;
    };
}

function Local(name, index) {
    var _this = this;

    this.getIndex = function () {
        return index;
    };

    this.toString = function () {
        return "Local(" + name + ")";
    };

    this.getReadNode = function (contextLevel, source) {
        return createVariableRead(_this, contextLevel, source);
    };

    this.getWriteNode = function (contextLevel, valueExpr, source) {
        return createVariableWrite(this, contextLevel, valueExpr, source);
    }
}
