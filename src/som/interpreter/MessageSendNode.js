'use strict';

function MessageSendNode(selector, _argumentNodes, _dispatchNode, source) {
    Node.call(this, source);
    var _this = this;
    _this._children_arguments = _this.adopt(_argumentNodes);
    _this._child_dispatch     = _this.adopt(_dispatchNode);

    this.execute = function (frame) {
        var args = evaluateArguments(frame);
        return _this.doPreEvaluated(frame, args);
    };

    function evaluateArguments(frame) {
        var args = new Array(_this._children_arguments.length);
        for (var i = 0; i < _this._children_arguments.length; i++) {
            args[i] = _this._children_arguments[i].execute(frame);
            assert(args[i] != null);
        }
        return args;
    }

    this.doPreEvaluated = function (frame, args) {
        return _this._child_dispatch.executeDispatch(frame, args);
    };

    this.toString = function () {
        return "MsgSend(" + selector.getString() + ")";
    };
}
MessageSendNode.prototype = Object.create(Node.prototype);
