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

import { universe } from '../vm/Universe.js';

export function constructEmptyPrimitive(signature) {
  function _empty(_frame, _args) {
    universe.errorPrintln(`Warning: undefined primitive ${
      signature.getString()} called`);
  }
  return universe.newPrimitive(signature, _empty, null);
}

export class Primitives {
  constructor() {
    this.holder = null;
  }

  installPrimitivesIn(value) {
    this.holder = value;

    // Install the primitives from this primitives class
    this.installPrimitives();
  }

  installInstancePrimitive(selector, primFun, suppressWarning) {
    const signature = universe.symbolFor(selector);

    // Install the given primitive as an instance primitive in the holder class
    this.holder.addInstancePrimitive(universe.newPrimitive(
      signature, primFun, this.holder,
    ), suppressWarning);
  }

  installClassPrimitive(selector, primFun) {
    const signature = universe.symbolFor(selector);

    // Install the given primitive as an instance primitive in the class of
    // the holder class
    this.holder.getClass().addInstancePrimitive(universe.newPrimitive(
      signature, primFun, this.holder,
    ));
  }

  getEmptyPrimitive(selector) {
    const signature = universe.symbolFor(selector);
    return constructEmptyPrimitive(signature);
  }
}
