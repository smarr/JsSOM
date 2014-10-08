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
function ReturnException(result, targetFrame) {
    this.hasReachedTarget = function (current) {
        return current === targetFrame;
    };
    this.getResult = function () {
        return result;
    }
}

function ReturnNonLocalNode(exp, contextLevel, source) {
    ContextualNode.call(this, contextLevel, source);
    var _this = this;
    _this._child_exp = _this.adopt(exp);

    this.execute = function (frame) {
        var result = _this._child_exp.execute(frame);

        var ctx = _this.determineContext(frame);
        if (ctx.isOnStack()) {
            throw new ReturnException(result, ctx);
        } else {
            var outerReceiver = ctx.getReceiver();
            return outerReceiver.sendEscapedBlock(frame.getReceiver(), frame);
        }
    }
}
ReturnNonLocalNode.prototype = Object.create(ContextualNode.prototype);

function CatchNonLocalReturnNode(_body) {
    Node.call(this, null);
    var _this = this;
    this._child_body = _this.adopt(_body);

    this.execute = function (frame) {
        try {
            return _this._child_body.execute(frame);
        } catch (e) {
            if (e instanceof ReturnException) {
                if (e.hasReachedTarget(frame)) {
                    return e.getResult();
                }
            }
            throw e;
        } finally {
            frame.dropFromStack();
        }
    }
}
CatchNonLocalReturnNode.prototype = Object.create(Node.prototype);
