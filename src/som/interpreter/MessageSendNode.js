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
function MessageSendNode(selector, _argumentNodes, source) {
    Node.call(this, source);
    var _this = this;
    _this._children_arguments = _this.adopt(_argumentNodes);

    if (_argumentNodes[0].isSuperNode()) {
        _this._child_dispatch = _this.adopt(new UninitializedSuperDispatchNode(
            selector, _argumentNodes[0].getHolderClass(),
            _argumentNodes[0].isClassSide()))
    } else {
        _this._child_dispatch = _this.adopt(new GenericDispatchNode(selector));
    }

    this.execute = function (frame) {
        var args = evaluateArguments(frame);
        return _this._child_dispatch.executeDispatch(frame, args);
    };

    function evaluateArguments(frame) {
        var args = new Array(_this._children_arguments.length);
        for (var i = 0; i < _this._children_arguments.length; i++) {
            args[i] = _this._children_arguments[i].execute(frame);
            assert(args[i] != null);
        }
        return args;
    }

    this.toString = function () {
        return "MsgSend(" + selector.getString() + ")";
    };
}
MessageSendNode.prototype = Object.create(Node.prototype);
