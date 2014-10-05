'use strict';

function ArgumentReadNode(argIndex) {
    assert(argIndex >= 0);

    this.execute = function (frame) {
        return frame.getArg(argIndex);
    };

    this.doPreEvaluated = function (frame, args) {
        return args[argIndex];
    };
}
