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
function SArray(length, values) {
    SAbstractObject.call(this);
    var indexableFields = (values != null) ? values : new Array(length);

    if (values == null) {
        for (var i = 0; i < length; i++) {
            indexableFields[i] = som.nilObject;
        }
    }

    this.getIndexableField = function (idx) {
        return indexableFields[idx];
    };

    this.setIndexableField = function (idx, value) {
        indexableFields[idx] = value;
    };

    this.getIndexableFields = function () {
        return indexableFields;
    };

    this.getNumberOfIndexableFields = function () {
        return length;
    };

    function copyIndexableFields(to) {
        for (var i = 0; i < length; i++) {
            to.setIndexableField(i, indexableFields[i]);
        }
    }

    this.copyAndExtendWith = function (value) {
        var result = new SArray(length + 1);
        copyIndexableFields(result);
        result.setIndexableField(length, value);
    };

    this.getClass = function () {
        return som.arrayClass;
    };
}
SArray.prototype = Object.create(SAbstractObject.prototype);
