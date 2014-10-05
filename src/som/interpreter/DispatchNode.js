'use strict';

function GenericDispatchNode(selector) {
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

function SuperDispatchNode(selector, lookupClass) {
    var method = lookupClass.lookupInvokable(selector);

    if (method == null) {
        throw new RuntimeException("Currently #dnu with super sent is not yet implemented. ");
    }

    this.executeDispatch = function (frame, args) {
        return method.invoke(frame, arguments);
    };
}
