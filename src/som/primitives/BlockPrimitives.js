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

function BlockNPrimitives() {
    Primitives.call(this);
    // This is done directly in universe, here just a dummy
    this.installPrimitives = function () {}
}
BlockNPrimitives.prototype = Object.create(Primitives.prototype);
som.primitives["Block1"] = BlockNPrimitives;
som.primitives["Block2"] = BlockNPrimitives;
som.primitives["Block3"] = BlockNPrimitives;
