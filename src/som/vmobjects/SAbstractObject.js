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

    this.send = function (selectorString, args) {
        var selector = universe.symbolFor(selectorString);
        var invokable = args[0].getClass().lookupInvokable(selector);
        return invokable.invoke(args);
    };


    this.sendDoesNotUnderstand = function (selector, args) {
        // Allocate an array to hold the arguments, without receiver
        var argsArray = SArguments.getArgumentsWithoutReceiver(args);
        var dnuArgs = [args[0], selector, argsArray];
        return _this.send("doesNotUnderstand:arguments:", dnuArgs);
    };

    this.sendUnknownGlobal = function (globalName) {
        var args = [this, globalName];
        return _this.send("unknownGlobal:", args);
    };

    this.sendEscapedBlock = function (block) {
        var args = [this, block];
        return _this.send("escapedBlock:", args);
    };
}
