function UninitializedGlobalReadNode(globalName, source) {
    Node.call(this, source);
    var _this = this;

    function executeUnknownGlobal(frame) {
        var self = frame.getReceiver();
        return self.sendUnknownGlobal(globalName, frame);
    }

    this.execute = function (frame) {
        // Get the global from the universe
        var assoc = universe.getGlobalsAssociation(globalName);
        if (assoc != null) {
            return _this.replace(new CachedGlobalReadNode(assoc, source)).
                execute(frame);
        } else {
            return executeUnknownGlobal(frame);
        }
    };
}
UninitializedGlobalReadNode.prototype = Object.create(Node.prototype);


function CachedGlobalReadNode(assoc, source) {
    Node.call(this, source);

    this.execute = function (frame) {
        return assoc.getValue();
    };
}
CachedGlobalReadNode.prototype = Object.create(Node.prototype);
