/*
* Copyright (c) 2014-2019 Stefan Marr, mail@stefan-marr.de
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

const assert = require('../../lib/assert').assert;
const isInIntRange = require('../../lib/platform').isInIntRange;

const SAbstractObject = require('./SAbstractObject').SAbstractObject;
const u = require('../vm/Universe');

function intOrBigInt(val) {
  if (isInIntRange(val)) {
      return u.universe.newInteger(val | 0);
  } else {
      return u.universe.newBigInteger(BigInt(val));
  }
}

function SInteger(intVal) {
  assert(isInIntRange(intVal) && Math.floor(intVal) == intVal);
  SAbstractObject.call(this);

  this.getEmbeddedInteger = function () {
      return intVal;
  };

  this.getClass = function () {
      return u.integerClass;
  };

  function toDouble() {
      return u.universe.newDouble(intVal); // JS numbers are always doubles...
  }

  this.primLessThan = function (right) {
      var result;
      if (right instanceof SBigInteger) {
          result = BigInt(intVal).lesser(right.getEmbeddedBigInteger());
      } else if (right instanceof SDouble) {
          return toDouble.primLessThan(right);
      } else {
          result = intVal < right.getEmbeddedInteger();
      }
      return (result) ? u.trueObject : u.falseObject;
  };

  this.primAsString = function () {
      return u.universe.newString(intVal.toString());
  };

  this.primAdd = function (right) {
      if (right instanceof SBigInteger) {
          return u.universe.newBigInteger(
              right.getEmbeddedBigInteger().add(intVal));
      } else if (right instanceof SDouble) {
          return toDouble().primAdd(right);
      } else {
          var r = right.getEmbeddedInteger();
          return intOrBigInt(intVal + r);
      }
  };

  this.primSubtract = function (right) {
      if (right instanceof SBigInteger) {
          return u.universe.newBigInteger(
              right.getEmbeddedBigInteger().subtract(intVal));
      } else if (right instanceof SDouble) {
          return toDouble().primSubtract(right);
      } else {
          var r = right.getEmbeddedInteger();
          return intOrBigInt(intVal - r);
      }
  };

  this.primMultiply = function (right) {
      if (right instanceof SBigInteger) {
          return u.universe.newBigInteger(
              right.getEmbeddedBigInteger().multiply(intVal));
      } else if (right instanceof SDouble) {
          return toDouble().primMultiply(right);
      } else {
          var r = right.getEmbeddedInteger();
          return intOrBigInt(intVal * r);
      }
  };

  this.primDoubleDiv = function (right) {
      var result;
      if (right instanceof SBigInteger) {
          result = intVal / right.getEmbeddedBigInteger().toJSNumber();
      } else if (right instanceof SDouble) {
          result = intVal / right.getEmbeddedDouble();
      } else {
          result = intVal / right.getEmbeddedInteger();
      }
      return u.universe.newDouble(result);
  };

  this.primIntDiv = function (right) {
      if (right instanceof SBigInteger) {
          var result = BigInt(intVal).divide(right.getEmbeddedBigInteger());
          return u.universe.newBigInteger(result);
      } else if (right instanceof SDouble) {
          return toDouble(intVal).primIntDiv(right);
      } else {
          var result = Math.floor(intVal / right.getEmbeddedInteger());
          return u.universe.newInteger(result);
      }
  };

  this.primModulo = function (right) {
      if (right instanceof SBigInteger) {
          var result = BigInt(intVal).mod(right.getEmbeddedBigInteger());
          return u.universe.newBigInteger(result);
      } else if (right instanceof SDouble) {
          return toDouble(intVal).primModulo(right);
      } else {
          var r = right.getEmbeddedInteger();
          // Java has Math.floorMod, JavaScript can use this
          // but it is likely to be very inefficient
          var result = Math.floor(((intVal % r) + r) % r);
          return u.universe.newInteger(result);
      }
  };

  this.primAnd = function (right) {
      if (right instanceof SInteger) {
          return u.universe.newInteger(intVal & right.getEmbeddedInteger());
      }
      notYetImplemented(); // not supported by the library and, not sure what semantics should be
  };

  this.primEquals = function (right) {
      var result;
      if (right instanceof SBigInteger) {
          result = BigInt(intVal).equals(right.getEmbeddedBigInteger());
      } else if (right instanceof SDouble) {
          result = intVal == right.getEmbeddedDouble();
      } else if (right instanceof SInteger) {
          result = intVal == right.getEmbeddedInteger();
      } else {
          result = false;
      }
      return (result) ? u.trueObject : u.falseObject;
  };

  this.prim32BitUnsignedValue = function () {
      var arr = new Uint32Array(1);
      arr[0] = intVal;
      return intOrBigInt(arr[0]);
  }

  this.prim32BitSignedValue = function () {
      return u.universe.newInteger(intVal | 0);
  }
}
SInteger.prototype = Object.create(SAbstractObject.prototype);

function SDouble(doubleVal) {
  SAbstractObject.call(this);

  this.getEmbeddedDouble = function () {
      return doubleVal;
  };

  this.getClass = function () {
      return u.doubleClass;
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
      return u.universe.newDouble(doubleVal * asFloat(right));
  };

  this.primAdd = function (right) {
      return u.universe.newDouble(doubleVal + asFloat(right));
  };

  this.primAsInteger = function () {
      var val = doubleVal > 0 ? Math.floor(doubleVal) : Math.ceil(doubleVal);
      return u.universe.newInteger(val);
  };

  this.primAsString = function () {
      return u.universe.newString(doubleVal.toString());
  };

  this.primSubtract = function (right) {
      return u.universe.newDouble(doubleVal - asFloat(right))
  };

  this.primDoubleDiv = function (right) {
      return u.universe.newDouble(doubleVal / asFloat(right));
  };

  this.primIntDiv = function (right) {
      return u.universe.newInteger(Math.floor(doubleVal / asFloat(right)));
  };

  this.primModulo = function (right) {
      return u.universe.newDouble(doubleVal % asFloat(right));
  };

  this.primEquals = function (right) {
      return (doubleVal == asFloat(right)) ? u.trueObject : u.falseObject;
  };

  this.primLessThan = function (right) {
      return (doubleVal < asFloat(right)) ? u.trueObject : u.falseObject;
  }
}
SDouble.prototype = Object.create(SAbstractObject.prototype);

function SBigInteger(bigintVal) {
  SAbstractObject.call(this);

  this.getEmbeddedBigInteger = function () {
      return bigintVal;
  };

  this.getClass = function () {
      return u.integerClass;
  };

  this.primLessThan = function (right) {
      var result;
      if (right instanceof SDouble) {
          result = bigintVal.toJSNumber() < right;
      } else if (right instanceof SInteger) {
          result = bigintVal < right.getEmbeddedInteger();
      } else {
          result = bigintVal < right.getEmbeddedBigInteger();
      }
      return (result) ? u.trueObject : u.falseObject;
  };

  this.primAsString = function () {
      return u.universe.newString(bigintVal.toString());
  };

  this.primAdd = function (right) {
      if (right instanceof SBigInteger) {
          return u.universe.newBigInteger(right.getEmbeddedBigInteger() + bigintVal);
      } else if (right instanceof SDouble) {
          return u.universe.newDouble(bigintVal.toJSNumber() + right.getEmbeddedDouble());
      } else {
          return u.universe.newBigInteger(bigintVal + right.getEmbeddedInteger())
      }
  };

  this.primSubtract = function (right) {
      var result;
      if (right instanceof SBigInteger) {
          result = bigintVal - right.getEmbeddedBigInteger();
      } else if (right instanceof SDouble) {
          return u.universe.newDouble(bigintVal.toJSNumber() - right.getEmbeddedDouble());
      } else {
          result = bigintVal - right.getEmbeddedInteger()
      }
      return u.universe.newBigInteger(result);
  };

  this.primMultiply = function (right) {
      var result;
      if (right instanceof SBigInteger) {
          result = bigintVal * right.getEmbeddedBigInteger();
      } else if (right instanceof SDouble) {
          return u.universe.newDouble(bigintVal.toJSNumber() * right.getEmbeddedDouble());
      } else {
          result = bigintVal * right.getEmbeddedInteger()
      }
      return u.universe.newBigInteger(result);
  };

  this.primDoubleDiv = function (right) {
      var result;
      if (right instanceof SBigInteger) {
          result = bigintVal.toJSNumber() / right.getEmbeddedBigInteger().toJSNumber();
      } else if (right instanceof SDouble) {
          result = bigintVal.toJSNumber() / right.getEmbeddedDouble();
      } else {
          result = bigintVal.toJSNumber() / right.getEmbeddedInteger();
      }
      return  u.universe.newDouble(result);
  };

  this.primIntDiv = function (right) {
      var result;
      if (right instanceof SBigInteger) {
          result = bigintVal / right.getEmbeddedBigInteger();
      } else if (right instanceof SDouble) {
          return u.universe.newDouble(bigintVal.toJSNumber()).primIntDiv(right);
      } else {
          result = bigintVal / right.getEmbeddedInteger();
      }
      return u.universe.newBigInteger(result);
  };

  this.primModulo = function (right) {
      var result;
      if (right instanceof SBigInteger) {
          result = bigintVal % right.getEmbeddedBigInteger();
      } else if (right instanceof SDouble) {
          return u.universe.newDouble(bigintVal.toJSNumber()).primModulo(right);
      } else {
          result = bigintVal % right.getEmbeddedInteger();
      }
      return u.universe.newBigInteger(result);
  };

  this.primAnd = function (right) {
      notYetImplemented(); // not supported by the library and, not sure what semantics should be
  };

  this.primEquals = function (right) {
      var result;
      if (right instanceof SBigInteger) {
          result = bigintVal == right.getEmbeddedBigInteger();
      } else if (right instanceof SDouble) {
          result = bigintVal.toJSNumber() == right.getEmbeddedDouble();
      } else if (right instanceof SInteger) {
          result = bigintVal == right.getEmbeddedInteger();
      } else {
          result = false;
      }
      return (result) ? u.trueObject : u.falseObject;
  };

  this.prim32BitUnsignedValue = function () {
      var val = Number(bigintVal) >>> 0;
      return intOrBigInt(val);
  }

  this.prim32BitSignedValue = function () {
      var val = Number(bigintVal) >> 0;
      return intOrBigInt(val);
  }
}
SBigInteger.prototype = Object.create(SAbstractObject.prototype);

exports.SBigInteger = SBigInteger;
exports.SInteger = SInteger;
exports.SDouble = SDouble;

exports.isInIntRange = isInIntRange;
