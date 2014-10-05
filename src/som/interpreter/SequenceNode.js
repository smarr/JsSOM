'use strict';

function SequenceNode(expressions, source) {
    Node.call(this, source);

    this.execute = function (frame) {
        for (var i = 0; i < expressions.length - 1; i++) {
            expressions[i].execute(frame);
        }
        return expressions[expressions.length - 1].execute(frame);
    };
}
SequenceNode.prototype = Object.create(Node.prototype);
