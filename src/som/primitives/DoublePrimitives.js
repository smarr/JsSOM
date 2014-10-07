'use strict';

function DoublePrimitives() {
    Primitives.call(this);
    var _this = this;

    function _coerce_to_double(obj) {
        if (obj instanceof SDouble) {
            return obj;
        }
        if (obj instanceof SInteger) {
            return universe.newDouble(obj.getEmbeddedInteger());
        }
        throw IllegalStateException("Cannot coerce " + obj.toSource()
            + " to Double!");
    }

    function _asString(frame, args) {
        return args[0].primAsString();
    }

    function _sqrt(frame, args) {
        return universe.newDouble(
            Math.sqrt(args[0].getEmbeddedDouble()))
    }

    function _plus(frame, args) {
        return args[0].primAdd(args[1]);
    }

    function _minus(frame, args) {
        return args[0].primSubtract(args[1]);
    }

    function _mult(frame, args) {
        return args[0].primMultiply(args[1]);
    }

    function _doubleDiv(frame, args) {
        return args[0].primDoubleDiv(args[1])
    }

    function _mod(frame, args) {
        return args[0].primModulo(args[1])
    }

    function _equals(frame, args) {
        return args[0].primEquals(args[1])
    }

    function _lessThan(frame, args) {
        return args[0].primLessThan(args[1])
    }

    function _round(frame, args) {
        var intVal = Math.round(args[0].getEmbeddedDouble());
        return universe.newInteger(intVal);
    }

    this.installPrimitives = function () {
        _this.installInstancePrimitive("asString",  _asString);
        _this.installInstancePrimitive("round",     _round);
        _this.installInstancePrimitive("sqrt",      _sqrt);
        _this.installInstancePrimitive("+",         _plus);
        _this.installInstancePrimitive("-",         _minus);
        _this.installInstancePrimitive("*",         _mult);
        _this.installInstancePrimitive("//",        _doubleDiv);
        _this.installInstancePrimitive("%",         _mod);
        _this.installInstancePrimitive("=",         _equals);
        _this.installInstancePrimitive("<",         _lessThan);
    }
}
DoublePrimitives.prototype = Object.create(Primitives.prototype);
som.primitives["Double"] = DoublePrimitives;
