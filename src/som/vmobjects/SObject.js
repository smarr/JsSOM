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
const SAbstractObject = require('./SAbstractObject').SAbstractObject;
const u = require('../vm/Universe');

class SObject extends SAbstractObject {
    constructor(instanceClass, numFields) {
        super();
        var clazz = instanceClass,
            objectFields = new Array((instanceClass === null) ?
                numFields : instanceClass.getNumberOfInstanceFields());

        for (var i = 0; i < objectFields.length; i++) {
            objectFields[i] = u.nilObject;
        }

        this.getNumberOfFields = function () {
            return objectFields.length;
        };

        this.setClass = function (value) {
            clazz = value;
        };

        this.getClass = function () {
            return clazz;
        };

        this.getFieldIndex = function (fieldNameSymbol) {
            return clazz.lookupFieldIndex(fieldNameSymbol);
        };

        this.getField = function (index) {
            return objectFields[index];
        };

        this.setField = function (idx, value) {
            objectFields[idx] = value;
        };
    }
}

exports.SObject = SObject;
