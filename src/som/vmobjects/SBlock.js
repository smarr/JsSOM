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

import { assert } from '../../lib/assert.js';

import { SAbstractObject } from './SAbstractObject.js';

import { universe } from '../vm/Universe.js';

function computeSignatureString(numberOfArguments) {
  // Compute the signature string
  let signatureString = 'value';
  if (numberOfArguments > 1) { signatureString += ':'; }

  // Add extra value: selector elements if necessary
  for (let i = 2; i < numberOfArguments; i += 1) {
    signatureString += 'with:';
  }
  return signatureString;
}

function _value(frame, args) {
  const rcvrBlock = args[0];
  return rcvrBlock.getMethod().invoke(frame, args);
}

export function getBlockEvaluationPrimitive(numberOfArguments, rcvrClass) {
  const sig = universe.symbolFor(computeSignatureString(numberOfArguments));
  return universe.newPrimitive(sig, _value, rcvrClass);
}

export class SBlock extends SAbstractObject {
  constructor(blockMethod, context) {
    super();
    this.blockClass = universe.blockClasses[blockMethod.getNumberOfArguments()];
    this.context = context;
    this.blockMethod = blockMethod;
  }

  getClass() {
    return this.blockClass;
  }

  getMethod() {
    return this.blockMethod;
  }

  getContext() {
    return this.context;
  }

  getOuterSelf() {
    assert(this.context != null);
    return this.context.getReceiver();
  }
}
