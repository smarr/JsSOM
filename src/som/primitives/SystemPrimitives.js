function SystemPrimitives() {
    Primitives.call(this);
    var _this = this;

    function _load(frame, args) {
        var symbol = args[1];
        var result = universe.loadClass(symbol);
        return (result != null) ? result : som.nilObject;
    }

    function _exit(frame, args) {
        var error = args[1];
        return universe.exit(error.getEmbeddedInteger());
    }

    function _global(frame, args) {
        var symbol = args[1];
        var result = universe.getGlobal(symbol);
        return (result != null) ? result : som.nilObject;
    }

    function _hasGlobal(frame, args) {
        if (universe.hasGlobal(args[1])) {
            return som.trueObject;
        } else {
            return som.falseObject;
        }
    }

    function _globalPut(frame, args) {
        var value  = args[2];
        var symbol = args[1];
        universe.setGlobal(symbol, value);
        return value;
    }

    function _printString(frame, args) {
        var str = args[1];
        universe.print(str.getEmbeddedString());
        return args[0];
    }

    function _printNewline(frame, args) {
        universe.println("");
        return args[0];
    }

    function _time(frame, args) {
        var diff = getMillisecondTicks() - som.startTime;
        return intOrBigInt(diff);
    }

    function _ticks(frame, args) {
        var diff = getMillisecondTicks() - som.startTime;
        return intOrBigInt(diff * 1000);
    }

    function _fullGC(frame, args) {
        /* not general way to do that in JS */
        return som.falseObject;
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
