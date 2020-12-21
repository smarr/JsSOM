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

export class SArray extends SAbstractObject {
  constructor(length, values) {
    super();
    this.length = length;
    this.indexableFields = (values != null) ? values : new Array(length);

    if (values == null) {
      for (let i = 0; i < length; i += 1) {
        this.indexableFields[i] = universe.nilObject;
      }
    }
  }

  getIndexableField(idx) {
    return this.indexableFields[idx];
  }

  setIndexableField(idx, value) {
    this.indexableFields[idx] = value;
  }

  getIndexableFields() {
    return this.indexableFields;
  }

  getNumberOfIndexableFields() {
    return this.length;
  }

  copyIndexableFields(to) {
    for (let i = 0; i < this.length; i += 1) {
      to.setIndexableField(i, this.indexableFields[i]);
    }
  }

  copyAndExtendWith(value) {
    const result = new SArray(this.length + 1);
    this.copyIndexableFields(result);
    result.setIndexableField(this.length, value);
  }

  getClass() {
    return universe.arrayClass;
  }
}
