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
const assert = require('../../lib/assert').assert;

const SAbstractObject = require('./SAbstractObject').SAbstractObject;

const u = require('../vm/Universe');

function getBlockEvaluationPrimitive(numberOfArguments, rcvrClass) {
    function _value(frame, args) {
        var rcvrBlock = args[0];
        return rcvrBlock.getMethod().invoke(frame, args);
    }

    function computeSignatureString() {
        // Compute the signature string
        var signatureString = "value";
        if (numberOfArguments > 1) { signatureString += ":"; }

        // Add extra value: selector elements if necessary
        for (var i = 2; i < numberOfArguments; i++) {
            signatureString += "with:";
        }
        return signatureString;
    }

    var sig = u.universe.symbolFor(computeSignatureString(numberOfArguments));
    return u.universe.newPrimitive(sig, _value, rcvrClass);
}

class SBlock extends SAbstractObject {
    constructor(blockMethod, context) {
        super();
        const blockClass = u.blockClasses[blockMethod.getNumberOfArguments()];

        this.getClass = function () {
            return blockClass;
        };

        this.getMethod = function () {
            return blockMethod;
        };

        this.getContext = function () {
            return context;
        };

        this.getOuterSelf = function () {
            assert(context != null);
            return context.getReceiver();
        };
    }
}

exports.SBlock = SBlock;
exports.getBlockEvaluationPrimitive = getBlockEvaluationPrimitive;
