'use strict';

function SystemPrimitives() {
    Primitives.call(this);
    var _this = this;



    function _load(args) {
        var symbol = args[1];
        var result = universe.loadClass(symbol);
        return (result != null) ? result : universe.nilObject;
    }

    function _exit(args) {
        var error = args[1];
        return universe.exit(error.getEmbeddedInteger());
    }

    function _global(args) {
        var symbol = args[1];
        var result = universe.getGlobal(symbol);
        return (result != null) ? result : universe.nilObject;
    }

    function _hasGlobal(args) {
        if (universe.hasGlobal(args[1])) {
            return universe.trueObject;
        } else {
            return universe.falseObject;
        }
    }

    function _globalPut(args) {
        var value  = args[2];
        var symbol = args[1];
        universe.setGlobal(symbol, value);
        return value;
    }

    function _printString(args) {
        var str = args[1];
        universe.print(str.getEmbeddedString());
        return args[0];
    }

    function _printNewline(args) {
        universe.println("");
        return args[0];
    }

    function _time(args) {
        var startTime = performance.now() - som.startTime;
        return universe.newInteger(Math.round(startTime));
    }

    function _ticks(args) {
        var startTime = performance.now() - som.startTime;
        return universe.newInteger(Math.round(startTime * 1000));
    }

    function _fullGC(args) {
        /* not general way to do that in JS */
        return universe.falseObject;
    }

    this.installPrimitives = function () {
        _this.installInstancePrimitive("load:",             _load);
        _this.installInstancePrimitive("exit:",             _exit);
        _this.installInstancePrimitive("hasGlobal:",        _hasGlobal);
        _this.installInstancePrimitive("global:",           _global);
        _this.installInstancePrimitive("global:put:",       _globalPut);
        _this.installInstancePrimitive("printString:",      _printString);
        _this.installInstancePrimitive("printNewline",      _printNewline);
        _this.installInstancePrimitive("time",              _time);
        _this.installInstancePrimitive("ticks",             _ticks);
        _this.installInstancePrimitive("fullGC",            _fullGC);

    }
}
SystemPrimitives.prototype = Object.create(Primitives.prototype);
som.primitives["System"] = SystemPrimitives;
