'use strict';

function MethodPrimitives() {
    Primitives.call(this);
    var _this = this;

    function _holder(frame, args) {
        return args[0].getHolder();
    }

    function _signature(frame, args) {
        return args[0].getSignature();
    }

    function _invokeOnWith(frame, args) {
        notYetImplemented(); // TODO: need to make up the right array, with rcvr and args...

        var directArgs;
        if (args[2] === universe.nilObject) {
            directArgs = [];
        } else {
            directArgs = args[1].getIndexableFields();
        }
        return args[0].invoke(args[0], direct_args)
    }

    this.installPrimitives = function () {
        _this.installInstancePrimitive("holder",         _holder);
        _this.installInstancePrimitive("signature",      _signature);
        _this.installInstancePrimitive("invokeOn:with:", _invokeOnWith);
    }
}
MethodPrimitives.prototype = Object.create(Primitives.prototype);
som.primitives["Method"] = MethodPrimitives;
