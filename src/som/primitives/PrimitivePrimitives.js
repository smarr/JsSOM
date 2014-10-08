function PrimitivePrimitives() {
    Primitives.call(this);
    var _this = this;

    function _holder(frame, args) {
        return args[0].getHolder();
    }

    function _signature(frame, args) {
        return args[0].getSignature();
    }

    function _invokeOnWith(frame, args) {
        var method = args[0];
        var rcvr   = args[1];
        var argArr = args[2];


        var directArgs;
        if (argArr === som.nilObject) {
            directArgs = [];
        } else {
            directArgs = argArr.getIndexableFields();
        }
        var newArgs = [rcvr].concat(directArgs);
        return method.invoke(frame, newArgs);
    }

    this.installPrimitives = function () {
        _this.installInstancePrimitive("holder",         _holder);
        _this.installInstancePrimitive("signature",      _signature);
        _this.installInstancePrimitive("invokeOn:with:", _invokeOnWith);
    }
}
PrimitivePrimitives.prototype = Object.create(Primitives.prototype);
som.primitives["Primitive"] = PrimitivePrimitives;
