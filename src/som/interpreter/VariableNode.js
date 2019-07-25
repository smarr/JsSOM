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
const ContextualNode = require('./ContextualNode').ContextualNode;

function VariableReadNode(contextLevel, local, source) {
    ContextualNode.call(this, contextLevel, source);
    var _this = this;

    this.execute = function (frame) {
        var ctx = _this.determineContext(frame);
        return ctx.getTemp(local.getIndex());
    }
}
VariableReadNode.prototype = Object.create(ContextualNode.prototype);

function VariableWriteNode(contextLevel, local, _valueExpr, source) {
    ContextualNode.call(this, contextLevel, source);
    var _this = this;
    _this._child_value = _this.adopt(_valueExpr);

    this.execute = function (frame) {
        var val = _this._child_value.execute(frame);

        var ctx = _this.determineContext(frame);
        ctx.setTemp(local.getIndex(), val);
        return val;
    }
}
VariableReadNode.prototype = Object.create(ContextualNode.prototype);

exports.VariableReadNode = VariableReadNode;
exports.VariableWriteNode = VariableWriteNode;
