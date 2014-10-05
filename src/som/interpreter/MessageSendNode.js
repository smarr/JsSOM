'use strict';

function MessageSendNode(selector, argumentNodes, dispatchNode, source) {
    Node.call(this, source);
    var _this = this;

    this.execute = function (frame) {
        var args = evaluateArguments(frame);
        return _this.doPreEvaluated(frame, args);
    };

    function evaluateArguments(frame) {
        var args = new Array(argumentNodes.length);
        for (var i = 0; i < argumentNodes.length; i++) {
            args[i] = argumentNodes[i].execute(frame);
            assert(args[i] != null);
        }
        return args;
    }

    this.doPreEvaluated = function (frame, args) {
        return dispatchNode.executeDispatch(frame, args);
    };

    this.toString = function () {
        return "MsgSend(" + selector.getString() + ")";
    };
}
MessageSendNode.prototype = Object.create(Node.prototype);
