'use strict';


function SInvokable(signature, _holder) {
    SAbstractObject.call(this);
    var holder = _holder;

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
}
SInvokable.prototype = Object.create(SAbstractObject.prototype);

function SMethod(signature, sourceSection, bodyNode, numberOfTemps) {
    SInvokable.call(this, signature, null);
    var _this = this;

    this.getClass = function () {
        return som.methodClass;
    };

    this.isPrimitive = function () {
        return false;
    };

    this.invoke = function(frame, args) {
        var newFrame = new Frame(frame, args, numberOfTemps);
        return bodyNode.execute(newFrame, args);
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

function SPrimitive(signature, primFun, _holder) {
    SInvokable.call(this, signature, _holder);
    var _this = this;

    this.getClass = function () {
        return som.primitiveClass;
    };

    this.isPrimitive = function () {
        return true;
    };

    this.invoke = function (frame, args) {
        return primFun(args);
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
