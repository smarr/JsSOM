/*
* Copyright (c) 2014 Stefan Marr, mail@stefan-marr.de
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/
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
