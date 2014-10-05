'use strict';

function UnaryExpressionNode(source) {
    Node.call(this, source);
    var _this = this;

    this.doPreEvaluated = function (frame, args) {
        return _this.executeEvaluated(frame, args[0]);
    };
}
UnaryExpressionNode.prototype = Object.create(Node.prototype);
