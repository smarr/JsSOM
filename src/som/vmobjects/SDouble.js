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
function SDouble(doubleVal) {
    SAbstractObject.call(this);

    this.getEmbeddedDouble = function () {
        return doubleVal;
    };

    this.getClass = function () {
        return som.doubleClass;
    };
    
    function asFloat(obj) {
        if (obj instanceof SDouble) {
            return obj.getEmbeddedDouble();
        } else if (obj instanceof SInteger) {
            return obj.getEmbeddedInteger();
        }
        throw new RuntimeException("Cannot coerce " + obj + " to Double!");
    }

    this.primMultiply = function (right) {
        return universe.newDouble(doubleVal * asFloat(right));
    };

    this.primAdd = function (right) {
        return universe.newDouble(doubleVal + asFloat(right));
    };

    this.primAsString = function () {
        return universe.newString(doubleVal.toString());
    };

    this.primSubtract = function (right) {
        return universe.newDouble(doubleVal - asFloat(right))
    };

    this.primDoubleDiv = function (right) {
        return universe.newDouble(doubleVal / asFloat(right));
    };

    this.primIntDiv = function (right) {
        return universe.newInteger(Math.floor(doubleVal / asFloat(right)));
    };

    this.primModulo = function (right) {
        return universe.newDouble(doubleVal % asFloat(right));
    };

    this.primEquals = function (right) {
        return (doubleVal == asFloat(right)) ? som.trueObject : som.falseObject;
    };

    this.primLessThan = function (right) {
        return (doubleVal < asFloat(right)) ? som.trueObject : som.falseObject;
    }
}
SDouble.prototype = Object.create(SAbstractObject.prototype);
