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
const universe = require('../vm/Universe');

function Frame(callerFrame, args, numTemps) {
    var isOnStack = true,
        temps     = new Array(numTemps);

    for (var i = 0; i < numTemps; i++) {
        temps[i] = universe.nilObject;
    }

    this.getReceiver = function () {
        return args[0];
    };

    this.getArgument = function (idx) {
        return args[idx];
    };

    this.setArgument = function (idx, val) {
        args[idx] = val;
    };

    this.getTemp = function (idx) {
        return temps[idx];
    };

    this.setTemp = function (idx, value) {
        temps[idx] = value;
    };

    this.isOnStack = function () {
        return isOnStack;
    };

    this.dropFromStack = function () {
        isOnStack = false;
    };
}

exports.Frame = Frame;
