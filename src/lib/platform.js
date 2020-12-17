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
if (typeof global === "undefined" || process.browser) {
    // this seems to be a browser environment
    if (typeof performance === "undefined" || performance.now == undefined) {
        exports.getMillisecondTicks = function () {
            return Date.now();
        };
    } else {
        exports.getMillisecondTicks = function () {
            return performance.now();
        };
    }

    exports.stdout = function (msg) {
        document.write(msg);
    };

    exports.stdoutnl = function (msg) {
        document.writeln(msg + "<br/>");
    };

    exports.stderr = function (msg) {
        document.write("<span style='color:red';>" + msg + "</span>");
    };

    exports.stderrnl = function (msg) {
        document.writeln("<span style='color:red';>" + msg + "<br/></span>")
    };

    exports.exitInterpreter = function (errorCode) {};

    exports.isBrowser = true;
} else {
    // this seems to be node.js
    exports.getMillisecondTicks = function () {
        var timeTuple = process.hrtime();
        return timeTuple[0] * 1000 + timeTuple[1]/1000000;
    };

    exports.stdout = function (msg) {
        process.stdout.write(msg);
    };

    exports.stdoutnl = function (msg) {
        process.stdout.write(msg + "\n");
    };

    exports.stderr = function (msg) {
        process.stderr.write(msg);
    };

    exports.stderrnl = function (msg) {
        process.stderr.write(msg + "\n");
    };

    exports.exitInterpreter = function (errorCode) {
        process.exit(errorCode);
    };

    exports.isBrowser = false;
}

function isInIntRange(val) {
    return val >= -2147483647 && val <= 2147483647;
}

function intOrBigInt(val, universe) {
    if (isInIntRange(val)) {
        if (typeof val === "bigint") {
            return universe.newInteger(Number(val) | 0);
        }
        return universe.newInteger(val | 0);
    } else {
        return universe.newBigInteger(val);
    }
}

exports.isInIntRange = isInIntRange;
exports.intOrBigInt = intOrBigInt;
