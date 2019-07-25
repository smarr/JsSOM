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
const Node = require('./Node').Node;
const u = require('../vm/Universe');

function UninitializedGlobalReadNode(globalName, source) {
    Node.call(this, source);
    var _this = this;

    function executeUnknownGlobal(frame) {
        var self = frame.getReceiver();
        return self.sendUnknownGlobal(globalName, frame);
    }

    this.execute = function (frame) {
        // Get the global from the universe
        var assoc = u.universe.getGlobalsAssociation(globalName);
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

exports.UninitializedGlobalReadNode = UninitializedGlobalReadNode;
