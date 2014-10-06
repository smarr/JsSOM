'use strict';

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
