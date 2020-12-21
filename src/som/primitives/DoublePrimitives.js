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

function _asInteger(_frame, args) {
  return args[0].primAsInteger();
}

function _asString(_frame, args) {
  return args[0].primAsString();
}

function _sqrt(_frame, args) {
  return universe.newDouble(
    Math.sqrt(args[0].getEmbeddedDouble()),
  );
}

function _plus(_frame, args) {
  return args[0].primAdd(args[1]);
}

function _minus(_frame, args) {
  return args[0].primSubtract(args[1]);
}

function _mult(_frame, args) {
  return args[0].primMultiply(args[1]);
}

function _doubleDiv(_frame, args) {
  return args[0].primDoubleDiv(args[1]);
}

function _mod(_frame, args) {
  return args[0].primModulo(args[1]);
}

function _equals(_frame, args) {
  return args[0].primEquals(args[1]);
}

function _lessThan(_frame, args) {
  return args[0].primLessThan(args[1]);
}

function _round(_frame, args) {
  const intVal = Math.round(args[0].getEmbeddedDouble());
  return universe.newInteger(intVal);
}

function _sin(_frame, args) {
  const val = Math.sin(args[0].getEmbeddedDouble());
  return universe.newDouble(val);
}

function _cos(_frame, args) {
  const val = Math.cos(args[0].getEmbeddedDouble());
  return universe.newDouble(val);
}

function _positiveInfinity(_frame, _args) {
  return universe.newDouble(Number.POSITIVE_INFINITY);
}
class DoublePrimitives extends Primitives {
  installPrimitives() {
    this.installInstancePrimitive('asInteger', _asInteger);
    this.installInstancePrimitive('asString', _asString);
    this.installInstancePrimitive('round', _round);
    this.installInstancePrimitive('sqrt', _sqrt);
    this.installInstancePrimitive('+', _plus);
    this.installInstancePrimitive('-', _minus);
    this.installInstancePrimitive('*', _mult);
    this.installInstancePrimitive('//', _doubleDiv);
    this.installInstancePrimitive('%', _mod);
    this.installInstancePrimitive('=', _equals);
    this.installInstancePrimitive('<', _lessThan);
    this.installInstancePrimitive('sin', _sin);
    this.installInstancePrimitive('cos', _cos);

    this.installClassPrimitive('PositiveInfinity', _positiveInfinity);
  }
}

export const prims = DoublePrimitives;
