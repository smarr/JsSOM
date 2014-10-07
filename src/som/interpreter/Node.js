'use strict';

function Node(source) {
    var _this = this;

    this._parent = null;

    this.getSource = function () { return source; };

    this.adopt = function (nodeOrNodes) {
        if (nodeOrNodes instanceof Array) {
            for (var i in nodeOrNodes) {
                nodeOrNodes[i]._parent = _this;
            }
        } else {
            nodeOrNodes._parent = _this;
        }
        return nodeOrNodes;
    };

    this.replace = function (newNode) {
        var parent   = _this._parent;
        var replaced = false;

        for (var prop in parent) {
            if (prop.indexOf("_child") == 0) {
                if (prop.indexOf("_children") == 0) { // an array with child nodes
                    var children = parent[prop];
                    for (var i in children) {
                        if (children[i] === _this) {
                            children[i] = newNode;
                            replaced = true;
                        }
                    }
                } else { // just a simple child node
                    if (parent[prop] === _this) {
                        parent[prop] = newNode;
                        replaced = true;
                    }
                }
            }
        }

        if (!replaced && _this._parent != null) {
            debugger; // node was not replaced???
        }
        return newNode;
    };

    this.isSuperNode = function () {
        return false;
    };
}
