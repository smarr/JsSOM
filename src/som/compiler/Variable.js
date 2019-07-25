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
const factory = require('../interpreter/NodeFactory');

function Argument(name, index) {
    var _this = this;

    this.toString = function () {
        return "Argument(" + name + ")";
    };

    this.isSelf = function () {
        return "self" == name || "$blockSelf" == name;
    };

    this.getReadNode = function (contextLevel, source) {
        return factory.createArgumentRead(_this, contextLevel, source);
    };

    this.getWriteNode = function (contextLevel, valueExpr, source) {
        return factory.createArgumentWrite(this, contextLevel, valueExpr, source);
    }

    this.getSuperReadNode = function (contextLevel, holderClass, classSide, source) {
        return factory.createSuperRead(
            _this, contextLevel, holderClass, classSide, source);
    };

    this.getIndex = function () {
        return index;
    };
}

function Local(name, index) {
    var _this = this;

    this.getIndex = function () {
        return index;
    };

    this.toString = function () {
        return "Local(" + name + ")";
    };

    this.getReadNode = function (contextLevel, source) {
        return factory.createVariableRead(_this, contextLevel, source);
    };

    this.getWriteNode = function (contextLevel, valueExpr, source) {
        return factory.createVariableWrite(this, contextLevel, valueExpr, source);
    }
}

exports.Argument = Argument;
exports.Local = Local;
