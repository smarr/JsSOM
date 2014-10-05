'use strict';


function SInvokable(signature, bodyNode) {
    SAbstractObject.call(this);
    var holder = null;

    this.getHolder = function () {
        return holder;
    };

    this.setHolder = function (value) {
        holder = value;
    };

    this.getSignature = function () {
        return signature;
    };

    this.getNumberOfArguments = function () {
        return signature.getNumberOfSignatureArguments();
    };

    this.invoke = function(frame, args) {
        assert(false); // TODO: needs to be implemented.
        // --> need to create a frame etc...
        return callTarget.call(arguments);
    };
}
SInvokable.prototype = Object.create(SAbstractObject.prototype);

function SMethod(signature, bodyNode) {
    SInvokable.call(this, signature, bodyNode);
    var _this = this;

    this.getClass = function () {
        return som.methodClass;
    };

    this.toString = function () {
        var holder = _this.getHolder();
        if (holder == null) {
            return "Method(nil>>" + signature.toString() + ")";
        }

        return "Method(" + holder.getName().getString() + ">>" +
            signature().toString() + ")";
    };
}
SMethod.prototype = Object.create(SInvokable.prototype);

function SPrimitive(signature, bodyNode) {
    SInvokable.call(this, signature, bodyNode);
    var _this = this;

    this.getClass = function () {
        return som.primitiveClass;
    };

    this.toString = function () {
        var holder = _this.getHolder();
        if (holder == null) {
            return "Primitive(nil>>" + signature.toString() + ")";
        }

        return "Primitive(" + holder.getName().getString() + ">>" +
            signature().toString() + ")";
    };
}
SPrimitive.prototype = Object.create(SInvokable.prototype);
