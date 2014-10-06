'use strict';

function SymbolPrimitives() {
    Primitives.call(this);
    var _this = this;

    function _asString(args) {
        return universe.newString(args[0].getString());
    }

    this.installPrimitives = function () {
        _this.installInstancePrimitive("asString", _asString);
    }
}
SymbolPrimitives.prototype = Object.create(Primitives.prototype);
som.primitives["Symbol"] = SymbolPrimitives;
