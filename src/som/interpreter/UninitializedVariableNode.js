'use strict';

function UninitializedVariableReadNode(variable, contextLevel, source) {
    ContextualNode.call(this, contextLevel, source);
    var _this = this;

    this.execute = function (frame) {
        assert(false); // TODO: need to tell something about the variable to the new read node...
        var node = VariableReadNodeFactory.create(contextLevel, variable, source);
        return _this.replace(node).execute(frame);
    };
}
UninitializedVariableReadNode.prototype = Object.create(ContextualNode.prototype);

function UninitializedSuperReadNode(variable, contextLevel, holderClass,
                                    classSide, source) {
    ContextualNode.call(this, contextLevel, source);
    var _this = this;

    function getLexicalSuperClass() {
        var clazz = universe.getGlobal(holderClass);
        if (classSide) {
            clazz = clazz.getClass();
        }
        return clazz.getSuperClass();
    }

    this.execute = function(frame) {
        var node = SuperReadNodeFactory.create(contextLevel, variable.slot,
            getLexicalSuperClass(), source);
        return _this.replace(node).
            execute(frame);
    };
}
UninitializedSuperReadNode.prototype = Object.create(ContextualNode.prototype);

function UninitializedVariableWriteNode(variable, contextLevel, exp, source) {
    ContextualNode.call(this, contextLevel, source);
    var _this = this;

    this.execute = function(frame) {
        var node = VariableWriteNodeFactory.create(
            contextLevel, variable.slot, source, exp);
        return _this.replace(node).executeGeneric(frame);
    };
}
UninitializedVariableWriteNode.prototype = Object.create(ContextualNode.prototype);
