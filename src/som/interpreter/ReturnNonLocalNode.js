'use strict';

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
            return outerReceiver.sendEscapedBlock(frame.getReceiver());
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
