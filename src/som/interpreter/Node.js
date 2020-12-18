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
//@ts-check
"use strict";
class Node {
    constructor(source) {
        this.parent = null;
        this.source = source;
    }

    getSource() { return this.source; };

    adopt(nodeOrNodes) {
        if (nodeOrNodes instanceof Array) {
            for (var i in nodeOrNodes) {
                nodeOrNodes[i].parent = this;
            }
        } else {
            nodeOrNodes.parent = this;
        }
        return nodeOrNodes;
    }

    replace(newNode) {
        const parent = this.parent;
        let replaced = false;

        for (const prop in parent) {
            if (prop.indexOf("_child") == 0) {
                if (prop.indexOf("_children") == 0) { // an array with child nodes
                    const children = parent[prop];
                    for (const i in children) {
                        if (children[i] === this) {
                            children[i] = newNode;
                            replaced = true;
                        }
                    }
                } else { // just a simple child node
                    if (parent[prop] === this) {
                        parent[prop] = newNode;
                        replaced = true;
                    }
                }
            }
        }

        if (!replaced && this.parent != null) {
            // eslint-disable-next-line no-debugger
            debugger; // node was not replaced???
        }
        return newNode;
    }

    isSuperNode() {
        return false;
    }
}

exports.Node = Node;
