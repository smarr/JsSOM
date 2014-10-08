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
        return primFun(frame, args);
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
