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

import { SAbstractObject } from './SAbstractObject.js';
import { universe } from '../vm/Universe.js';

export class SObject extends SAbstractObject {
  constructor(instanceClass, numFields) {
    super();

    this.clazz = instanceClass;
    this.objectFields = new Array((instanceClass === null)
      ? numFields : instanceClass.getNumberOfInstanceFields());

    for (let i = 0; i < this.objectFields.length; i += 1) {
      this.objectFields[i] = universe.nilObject;
    }
  }

  getNumberOfFields() {
    return this.objectFields.length;
  }

  setClass(value) {
    this.clazz = value;
  }

  getClass() {
    return this.clazz;
  }

  getFieldIndex(fieldNameSymbol) {
    return this.clazz.lookupFieldIndex(fieldNameSymbol);
  }

  getField(index) {
    return this.objectFields[index];
  }

  setField(idx, value) {
    this.objectFields[idx] = value;
  }
}
