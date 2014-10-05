'use strict';

function LiteralNode(value, source) {
    Node.call(this, source);

    this.execute = function (frame) {
        return value;
    }
}
LiteralNode.prototype = Object.create(Node.prototype);
