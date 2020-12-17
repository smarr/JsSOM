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
const Primitives = require('./Primitives').Primitives;
const u = require('../vm/Universe');

const SString = require('../vmobjects/SString').SString;

function StringPrimitives() {
    Primitives.call(this);
    var _this = this;

    function _concat(frame, args) {
        var argument = args[1];
        return u.universe.newString(args[0].getEmbeddedString()
            + argument.getEmbeddedString());
    }

    function _asSymbol(frame, args) {
        return u.universe.symbolFor(args[0].getEmbeddedString());
    }

    function _length(frame, args) {
        return u.universe.newInteger(args[0].getEmbeddedString().length);
    }

    function _equals(frame, args) {
        var op1 = args[1];
        var op2 = args[0];
        if (op1 instanceof SString) {
            if (op1.getEmbeddedString() == op2.getEmbeddedString()) {
                return u.trueObject;
            }
        }
        return u.falseObject;
    }

    function _substring(frame, args) {
        var end   = args[2];
        var start = args[1];

        var s = start.getEmbeddedInteger() - 1;
        var e = end.getEmbeddedInteger();
        var string = args[0].getEmbeddedString();

        if (s < 0  ||  s >= string.length  ||  e > string.length  ||  e < s) {
            return u.universe.newString("Error - index out of bounds");
        } else {
            return u.universe.newString(string.substring(s, e));
        }
    }

    function _hashcode(frame, args) {
        var s = args[0].getEmbeddedString();

        // hash code from: http://stackoverflow.com/a/7616484/916546
        var hash = 0, i, chr, len;
        if (s.length == 0) {
            return u.universe.newInteger(hash);
        }

        for (i = 0, len = s.length; i < len; i++) {
            chr   = s.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return u.universe.newInteger(hash);
    }

    function _isWhiteSpace(frame, args) {
        const s = args[0].getEmbeddedString();

        if (s.match(/^\s+$/) !== null) {
            return u.trueObject;
        } else {
            return u.falseObject;
        }
    }

    function _isLetters(frame, args) {
        const s = args[0].getEmbeddedString();

        if (RegExp(/^\p{L}+$/,'u').test(s)) {
            return u.trueObject;
        } else {
            return u.falseObject;
        }
    }

    function _isDigits(frame, args) {
        const s = args[0].getEmbeddedString();

        if (s.match(/^\d+$/) !== null) {
            return u.trueObject;
        } else {
            return u.falseObject;
        }
    }

    this.installPrimitives = function () {
        _this.installInstancePrimitive("concatenate:",          _concat);
        _this.installInstancePrimitive("asSymbol",              _asSymbol);
        _this.installInstancePrimitive("length",                _length);
        _this.installInstancePrimitive("=",                     _equals);
        _this.installInstancePrimitive("primSubstringFrom:to:", _substring);
        _this.installInstancePrimitive("hashcode",              _hashcode);
        _this.installInstancePrimitive("isWhiteSpace",          _isWhiteSpace);
        _this.installInstancePrimitive("isLetters",             _isLetters);
        _this.installInstancePrimitive("isDigits",              _isDigits);
    };
}
StringPrimitives.prototype = Object.create(Primitives.prototype);
exports.prims = StringPrimitives;
