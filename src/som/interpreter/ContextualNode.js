'use strict';

function ContextualNode(contextLevel, source) {
    Node.call(this, source);

    this.getContextLevel = function() {
        return contextLevel;
    };

    this.determineContext = function (frame) {
        if (contextLevel == 0) { return frame; }

        var self = frame.getReceiver();
        var i = contextLevel - 1;

        while (i > 0) {
            self = self.getOuterSelf();
            i--;
        }
        return self.getContext();
    };

    this.determineOuterSelf = function (frame) {
        var self = frame.getReceiver();
        var i = contextLevel;
        while (i > 0) {
            self = self.getOuterSelf();
            i--;
        }
        return self;
    };
}
ContextualNode.prototype = Object.create(Node.prototype);
