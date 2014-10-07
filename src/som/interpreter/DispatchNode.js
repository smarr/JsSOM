'use strict';

function GenericDispatchNode(selector) {
    Node.call(this, null);

    this.executeDispatch = function (frame, args) {
        var rcvr = args[0];
        var rcvrClass = rcvr.getClass();

        var method = rcvrClass.lookupInvokable(selector);
        if (method != null) {
            return method.invoke(frame, args);
        } else {
            return rcvr.sendDoesNotUnderstand(selector, args);
        }
    };
}
GenericDispatchNode.prototype = Object.create(Node.prototype);

function UninitializedSuperDispatchNode(selector, holderClass, classSide) {
    Node.call(this, null);
    var _this = this;
    assert(holderClass instanceof SSymbol);

    function getLookupClass() {
        var clazz = universe.getGlobal(holderClass);
        if (classSide) {
            clazz = clazz.getClass();
        }
        return clazz.getSuperClass();
    }

    this.executeDispatch = function (frame, args) {
        var lookupClass = getLookupClass();
        return _this.replace(new CachedSuperDispatchNode(selector, lookupClass)).
            executeDispatch(frame, args);
    };
}
UninitializedSuperDispatchNode.prototype = Object.create(Node.prototype);

function CachedSuperDispatchNode(selector, lookupClass) {
    Node.call(this, null);
    assert(lookupClass instanceof SClass);
    var method = lookupClass.lookupInvokable(selector);

    if (method == null) {
        throw new RuntimeException("Currently #dnu with super sent is not yet implemented. ");
    }

    this.executeDispatch = function (frame, args) {
        return method.invoke(frame, arguments);
    };
}
CachedSuperDispatchNode.prototype = Object.create(Node.prototype);
