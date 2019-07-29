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
const RuntimeException = require('../../lib/exceptions').RuntimeException;

const Primitives = require('./Primitives').Primitives;

const u = require('../vm/Universe');

function BlockPrimitives() {
    Primitives.call(this);
    var _this = this;

    function _restart(_frame, _args) {
        throw new RuntimeException("Restart primitive is not supported, #whileTrue:"
            + " and #whileTrue: are intrisified so that #restart "
            + "is not needed.");
    }

    function _whileTrue(frame, args) {
        var conditionBlock = args[0];
        var bodyBlock = args[1];

        var cond = conditionBlock.getMethod().invoke(frame, [conditionBlock]);

        while (cond == u.trueObject) {
            bodyBlock.getMethod().invoke(frame, [bodyBlock]);
            cond = conditionBlock.getMethod().invoke(frame, [conditionBlock]);
        }

        return u.nilObject;
    }

    this.installPrimitives = function () {
        _this.installInstancePrimitive("restart",    _restart);
        _this.installInstancePrimitive("whileTrue:", _whileTrue);
    }
}
BlockPrimitives.prototype = Object.create(Primitives.prototype);
exports.prims = BlockPrimitives;
