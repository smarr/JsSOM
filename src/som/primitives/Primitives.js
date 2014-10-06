'use strict';


function constructEmptyPrimitive(signature) {
    function _empty(args) {
        universe.errorPrintln("Warning: undefined primitive " +
            signature.getString() + " called");
    }
    return universe.newPrimitive(signature, _empty, null);
}

function Primitives () {
    var holder = null,
        _this = this;

    this.installPrimitivesIn = function (value) {
        holder = value;

        // Install the primitives from this primitives class
        _this.installPrimitives();
    };

    this.installInstancePrimitive = function (selector, primFun) {
        var signature = universe.symbolFor(selector);

        // Install the given primitive as an instance primitive in the holder class
        holder.addInstancePrimitive(universe.newPrimitive(
            signature, primFun, holder));
    };

    this.installClassPrimitive = function (selector, primFun) {
        var signature = universe.symbolFor(selector);

        // Install the given primitive as an instance primitive in the class of
        // the holder class
        holder.getClass().addInstancePrimitive(universe.newPrimitive(
            signature, primFun, holder));
    };

    this.getEmptyPrimitive = function (selector) {
        var signature = universe.symbolFor(selector);
        return constructEmptyPrimitive(signature);
    }
}
