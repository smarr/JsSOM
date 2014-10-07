'use strict';

function BlockPrimitives() {
    Primitives.call(this);
    var _this = this;

    function _restart(frame, args) {
        throw new RuntimeException("Restart primitive is not supported, #whileTrue:"
            + " and #whileTrue: are intrisified so that #restart "
            + "is not needed.");
    }

    this.installPrimitives = function () {
        _this.installInstancePrimitive("restart", _restart);
    }
}
BlockPrimitives.prototype = Object.create(Primitives.prototype);
som.primitives["Block"] = BlockPrimitives;
