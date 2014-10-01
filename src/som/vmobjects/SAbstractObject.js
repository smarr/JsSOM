'use strict';

function SAbstractObject() {
    this.toString = function () {
        var clazz = getClass();
        if (clazz === null) {
            return "an Object(clazz==null)";
        }
        return "a " + clazz.getName().getString();
    };

    this.send = function (selectorString, args) {
        var selector = window.universe.symbolFor(selectorString);
        var invokable = args[0].getClass().lookupInvokable(selector);
        return invokable.invoke(args);
    };


    this.sendDoesNotUnderstand = function (selector, args) {
        // Allocate an array to hold the arguments, without receiver
        var argsArray = SArguments.getArgumentsWithoutReceiver(args);
        var dnuArgs = [args[0], selector, argsArray];
        return send("doesNotUnderstand:arguments:", dnuArgs);
    };

    this.sendUnknownGlobal = function (globalName) {
        var args = [this, globalName];
        return send("unknownGlobal:", arguments);
    };

    this.sendEscapedBlock = function (block) {
        var args = [this, block];
        return send("escapedBlock:", arguments);
    };
}
