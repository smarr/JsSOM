'use strict';

function BlockNode(blockMethod, source) {
    Node.call(this, source);

    this.execute = function(frame) {
        return universe.newBlock(blockMethod, frame);
    };
}
BlockNode.prototype = Object.create(Node.prototype);
