'use strict';

function ArgumentReadNode(contextLevel, arg, source) {
    ContextualNode.call(this, contextLevel, source);
    var _this = this;

    assert(arg.getIndex() >= 0);

    this.execute = function (frame) {
        var ctx = _this.determineContext(frame);
        return ctx.getArgument(arg.getIndex());
    };
}
ArgumentReadNode.prototype = Object.create(ContextualNode.prototype);
