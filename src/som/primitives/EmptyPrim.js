'use strict';

function EmptyPrim(rcvrExpr) {
    UnaryExpressionNode.call(this, null);
    var receiver = rcvrExpr,
        _this = this;

    this.executeGeneric = function (frame) {
        return _this.executeEvaluated(frame, null);
    };

    this.executeEvaluated = function (frame, receiver) {
        universe.println("Warning: undefined primitive called");
        return null;
    };
}
EmptyPrim.prototype = Object.create(UnaryExpressionNode.prototype);
