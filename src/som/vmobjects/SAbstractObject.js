'use strict';

function SAbstractObject() {
    var _this = this;

    this.toString = function () {
        var clazz = _this.getClass();
        if (clazz === null) {
            return "an Object(clazz==null)";
        }
        return "a " + clazz.getName().getString();
    };

    this.send = function (selectorString, callerFrame, args) {
        var selector = universe.symbolFor(selectorString);
        var invokable = args[0].getClass().lookupInvokable(selector);
        return invokable.invoke(callerFrame, args);
    };


    this.sendDoesNotUnderstand = function (selector, callerFrame, args) {
        // Allocate an array to hold the arguments, without receiver
        var argsArray = new SArray(args.length - 1, args.slice(1));
        var dnuArgs = [args[0], selector, argsArray];
        return _this.send("doesNotUnderstand:arguments:", callerFrame, dnuArgs);
    };

    this.sendUnknownGlobal = function (globalName, callerFrame) {
        var args = [this, globalName];
        return _this.send("unknownGlobal:", callerFrame, args);
    };

    this.sendEscapedBlock = function (block, callerFrame) {
        var args = [this, block];
        return _this.send("escapedBlock:", callerFrame, args);
    };
}
