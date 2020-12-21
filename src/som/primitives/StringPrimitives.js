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
// @ts-check

import { Primitives } from './Primitives.js';
import { universe } from '../vm/Universe.js';

import { SString } from '../vmobjects/SString.js';

function _concat(_frame, args) {
  const argument = args[1];
  return universe.newString(args[0].getEmbeddedString()
        + argument.getEmbeddedString());
}

function _asSymbol(_frame, args) {
  return universe.symbolFor(args[0].getEmbeddedString());
}

function _length(_frame, args) {
  return universe.newInteger(args[0].getEmbeddedString().length);
}

function _equals(_frame, args) {
  const op1 = args[1];
  const op2 = args[0];
  if (op1 instanceof SString) {
    if (op1.getEmbeddedString() === op2.getEmbeddedString()) {
      return universe.trueObject;
    }
  }
  return universe.falseObject;
}

function _substring(_frame, args) {
  const end = args[2];
  const start = args[1];

  const s = start.getEmbeddedInteger() - 1;
  const e = end.getEmbeddedInteger();
  const string = args[0].getEmbeddedString();

  if (s < 0 || s >= string.length || e > string.length || e < s) {
    return universe.newString('Error - index out of bounds');
  }
  return universe.newString(string.substring(s, e));
}

function _hashcode(_frame, args) {
  const s = args[0].getEmbeddedString();

  // hash code from: http://stackoverflow.com/a/7616484/916546
  let hash = 0; let i; let chr; let
    len;
  if (s.length === 0) {
    return universe.newInteger(hash);
  }

  for (i = 0, len = s.length; i < len; i += 1) {
    chr = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return universe.newInteger(hash);
}

function _isWhiteSpace(_frame, args) {
  const s = args[0].getEmbeddedString();

  if (s.match(/^\s+$/) !== null) {
    return universe.trueObject;
  }
  return universe.falseObject;
}

function _isLetters(_frame, args) {
  const s = args[0].getEmbeddedString();

  if (RegExp(/^\p{L}+$/, 'u').test(s)) {
    return universe.trueObject;
  }
  return universe.falseObject;
}

function _isDigits(_frame, args) {
  const s = args[0].getEmbeddedString();

  if (s.match(/^\d+$/) !== null) {
    return universe.trueObject;
  }
  return universe.falseObject;
}

class StringPrimitives extends Primitives {
  installPrimitives() {
    this.installInstancePrimitive('concatenate:', _concat);
    this.installInstancePrimitive('asSymbol', _asSymbol);
    this.installInstancePrimitive('length', _length);
    this.installInstancePrimitive('=', _equals);
    this.installInstancePrimitive('primSubstringFrom:to:', _substring);
    this.installInstancePrimitive('hashcode', _hashcode);
    this.installInstancePrimitive('isWhiteSpace', _isWhiteSpace);
    this.installInstancePrimitive('isLetters', _isLetters);
    this.installInstancePrimitive('isDigits', _isDigits);
  }
}

export const prims = StringPrimitives;
