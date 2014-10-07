'use strict';

function IntegerPrimitives() {
    Primitives.call(this);
    var _this = this;

    function _asString(frame, args) {
        return args[0].primAsString();
    }

    function _sqrt(frame, args) {
        var res = Math.sqrt(args[0].getEmbeddedInteger());
        if (res == Math.floor(res)) {
            return universe.newInteger(Math.floor(res));
        } else {
            return universe.newDouble(res);
        }
    }

    function _atRandom(frame, args) {
        return universe.newInteger(Math.floor(args[0].getEmbeddedInteger()
            * Math.random()));
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
        return args[0].primDoubleDiv(args[1]);
    }

    function _intDiv(frame, args) {
        return args[0].primIntDiv(args[1]);
    }

    function _mod(frame, args) {
        return args[0].primModulo(args[1]);
    }

    function _and(frame, args) {
        return args[0].primAnd(args[1]);
    }

    function _equals(frame, args) {
        return args[0].primEquals(args[1]);
    }

    function _lessThan(frame, args) {
        return args[0].primLessThan(args[1]);
    }

    function _fromString(frame, args) {
        var param = args[1];
        if (param instanceof SString) {
            return universe.nilObject;
        }
        var intVal = parseInt(param.getEmbeddedString());
        return universe.newInteger(intVal);
    }


    function _leftShift(frame, args) {
        var rightObj = args[1];
        var left     = args[0];

        var l = left.getEmbeddedInteger();
        var r = rightObj.getEmbeddedInteger();


        if (r >= 32) {
            notYetImplemented(); // currently not supported by bigInt lib
        }

        var result = l << r;
        if (Math.floor(l) != l) {
            notYetImplemented(); // this is indicating an overflow, I think, not supported yet
        }
        return universe.newInteger(result);
    }

    function _bitXor(frame, args) {
        var right = args[1];
        var left  = args[0];
        return universe.newInteger(left.getEmbeddedInteger()
            ^ right.getEmbeddedInteger())
    }

    this.installPrimitives = function () {
        _this.installInstancePrimitive("asString", _asString);
        _this.installInstancePrimitive("sqrt",     _sqrt);
        _this.installInstancePrimitive("atRandom", _atRandom);
        _this.installInstancePrimitive("+",        _plus);
        _this.installInstancePrimitive("-",        _minus);
        _this.installInstancePrimitive("*",        _mult);
        _this.installInstancePrimitive("//",       _doubleDiv);
        _this.installInstancePrimitive("/",        _intDiv);
        _this.installInstancePrimitive("%",        _mod);
        _this.installInstancePrimitive("&",        _and);
        _this.installInstancePrimitive("=",        _equals);
        _this.installInstancePrimitive("<",        _lessThan);
        _this.installInstancePrimitive("<<",       _leftShift);
        _this.installInstancePrimitive("bitXor:",  _bitXor);

        _this.installClassPrimitive("fromString:", _fromString);
    }
}
IntegerPrimitives.prototype = Object.create(Primitives.prototype);
som.primitives["Integer"] = IntegerPrimitives;
