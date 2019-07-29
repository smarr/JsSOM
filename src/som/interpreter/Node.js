/*
* Copyright (c) 2014 Stefan Marr, mail@stefan-marr.de
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/
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
            // eslint-disable-next-line no-debugger
            debugger; // node was not replaced???
        }
        return newNode;
    };

    this.isSuperNode = function () {
        return false;
    };
}

exports.Node = Node;
