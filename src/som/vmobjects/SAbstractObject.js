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
