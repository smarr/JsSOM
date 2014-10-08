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
function FieldReadNode(_selfExp, fieldIdx, source) {
    Node.call(this, source);
    assert(fieldIdx >= 0);
    var _this = this;

    _this._child_self = _this.adopt(_selfExp);

    this.execute = function (frame) {
        var self = _this._child_self.execute(frame);
        return self.getField(fieldIdx);
    }
}
FieldReadNode.prototype = Object.create(Node.prototype);

function FieldWriteNode(_selfExp, _valueExp, fieldIdx, source) {
    Node.call(this, source);
    assert(fieldIdx >= 0);
    var _this = this;

    _this._child_self  = _this.adopt(_selfExp);
    _this._child_value = _this.adopt(_valueExp);

    this.execute = function (frame) {
        var self  = _this._child_self.execute(frame);
        var value = _this._child_value.execute(frame);
        self.setField(fieldIdx, value);
        return value;
    };
}
FieldWriteNode.prototype = Object.create(Node.prototype);
