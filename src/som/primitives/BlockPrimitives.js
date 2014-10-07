'use strict';

function BlockPrimitives() {
    Primitives.call(this);
    var _this = this;

    function _restart(frame, args) {
        throw new RuntimeException("Restart primitive is not supported, #whileTrue:"
            + " and #whileTrue: are intrisified so that #restart "
            + "is not needed.");
    }

    function _whileTrue(frame, args) {
        var conditionBlock = args[0];
        var bodyBlock = args[1];

        var cond = conditionBlock.getMethod().invoke(frame, [conditionBlock]);

        while (cond == som.trueObject) {
            bodyBlock.getMethod().invoke(frame, [bodyBlock]);
            cond = conditionBlock.getMethod().invoke(frame, [conditionBlock]);
        }

        return som.nilObject;
    }

    this.installPrimitives = function () {
        _this.installInstancePrimitive("restart",    _restart);
        _this.installInstancePrimitive("whileTrue:", _whileTrue);
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
