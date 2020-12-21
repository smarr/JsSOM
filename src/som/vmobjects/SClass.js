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
import { SObject } from './SObject.js';
import { SArray } from './SArray.js';

import { universe } from '../vm/Universe.js';

import { prims as ArrayPrims } from '../primitives/ArrayPrimitives.js';
import { prims as BlockPrims } from '../primitives/BlockPrimitives.js';
import { prims as ClassPrims } from '../primitives/ClassPrimitives.js';
import { prims as DoublePrims } from '../primitives/DoublePrimitives.js';
import { prims as IntegerPrims } from '../primitives/IntegerPrimitives.js';
import { prims as MethodPrims } from '../primitives/MethodPrimitives.js';
import { prims as ObjectPrims } from '../primitives/ObjectPrimitives.js';
import { prims as PrimitivePrims } from '../primitives/PrimitivePrimitives.js';
import { prims as StringPrims } from '../primitives/StringPrimitives.js';
import { prims as SymbolPrims } from '../primitives/SymbolPrimitives.js';
import { prims as SystemPrims } from '../primitives/SystemPrimitives.js';

const prims = {
  Array: ArrayPrims,
  Block: BlockPrims,
  Class: ClassPrims,
  Double: DoublePrims,
  Integer: IntegerPrims,
  Method: MethodPrims,
  Object: ObjectPrims,
  Primitive: PrimitivePrims,
  String: StringPrims,
  Symbol: SymbolPrims,
  System: SystemPrims,
};

export class SClass extends SObject {
  constructor(clazz, numberOfFields) {
    super(clazz, numberOfFields);

    this.invokablesTable = new Map();
    this.superclass = null;
    this.name = null;
    this.instanceInvokables = null;
    this.instanceFields = null;
  }

  getSuperClass() {
    return this.superclass == null ? universe.nilObject : this.superclass;
  }

  setSuperClass(value) {
    this.superclass = value;
  }

  hasSuperClass() {
    return this.superclass != null;
  }

  getName() {
    return this.name;
  }

  setName(value) {
    this.name = value;
  }

  getInstanceFields() {
    return this.instanceFields;
  }

  setInstanceFields(fieldsArray) {
    assert(fieldsArray instanceof SArray);
    this.instanceFields = fieldsArray;
  }

  getInstanceInvokables() {
    return this.instanceInvokables;
  }

  getNumberOfInstanceInvokables() {
    // Return the number of instance invokables in this class
    return this.instanceInvokables.getNumberOfIndexableFields();
  }

  setInstanceInvokables(arr) {
    assert(arr instanceof SArray);
    this.instanceInvokables = arr;

    // Make sure this class is the holder of all invokables in the array
    const num = arr.getNumberOfIndexableFields();
    for (let i = 0; i < num; i += 1) {
      arr.getIndexableField(i).setHolder(this);
    }
  }

  getInstanceInvokable(index) {
    return this.instanceInvokables.getIndexableField(index);
  }

  setInstanceInvokable(index, value) {
    // Set this class as the holder of the given invokable
    value.setHolder(this);

    this.instanceInvokables.setIndexableField(index, value);

    if (!this.invokablesTable.has(value.getSignature())) {
      this.invokablesTable.set(value.getSignature(), value);
    }
  }

  lookupInvokable(selector) {
    // Lookup invokable and return if found
    let invokable = this.invokablesTable.get(selector);
    if (invokable != null) { return invokable; }

    // Lookup invokable with given signature in array of instance invokables
    const num = this.getNumberOfInstanceInvokables();
    for (let i = 0; i < num; i += 1) {
      // Get the next invokable in the instance invokable array
      invokable = this.getInstanceInvokable(i);

      // Return the invokable if the signature matches
      if (invokable.getSignature() === selector) {
        this.invokablesTable.set(selector, invokable);
        return invokable;
      }
    }

    // Traverse the super class chain by calling lookup on the super class
    if (this.hasSuperClass()) {
      invokable = this.getSuperClass().lookupInvokable(selector);
      if (invokable != null) {
        this.invokablesTable.set(selector, invokable);
        return invokable;
      }
    }

    // Invokable not found
    return null;
  }

  lookupFieldIndex(fieldName) {
    // Lookup field with given name in array of instance fields
    const num = this.getNumberOfInstanceFields();
    for (let i = num - 1; i >= 0; i -= 1) {
      // Return the current index if the name matches
      if (fieldName === this.getInstanceFieldName(i)) { return i; }
    }
    return -1; // Field not found
  }

  /**
     * @param {SInvokable} invokable
     */
  addInstanceInvokable(invokable) {
    // Add the given invokable to the array of instance invokables
    const num = this.getNumberOfInstanceInvokables();
    for (let i = 0; i < num; i += 1) {
      // Get the next invokable in the instance invokable array
      const currentInvokable = this.getInstanceInvokable(i);

      // Replace the invokable with the given one if the signature matches
      if (invokable.getSignature() === currentInvokable.getSignature()) {
        this.setInstanceInvokable(i, invokable);
        return false;
      }
    }

    this.setInstanceInvokable(num, invokable);
    return true;
  }

  addInstancePrimitive(value, suppressWarning) {
    if (this.addInstanceInvokable(value) && suppressWarning !== true) {
      universe.print(`Warning: Primitive ${value.getSignature().getString()}`);
      universe.println(` is not in class definition for class ${
        this.getName().getString()}`);
    }
  }

  getInstanceFieldName(index) {
    return this.instanceFields.getIndexableField(index);
  }

  getNumberOfInstanceFields() {
    return this.instanceFields.getNumberOfIndexableFields();
  }

  includesPrimitives(clazz) {
    // Lookup invokable with given signature in array of instance invokables
    for (let i = 0; i < clazz.getNumberOfInstanceInvokables(); i += 1) {
      // Get the next invokable in the instance invokable array
      if (clazz.getInstanceInvokable(i).isPrimitive()) {
        return true;
      }
    }
    return false;
  }

  hasPrimitives() {
    return this.includesPrimitives(this) || this.includesPrimitives(this.getClass());
  }

  loadPrimitives(displayWarning) {
    try {
      const Primitives = prims[this.name.getString()];

      if (Primitives !== undefined) {
        (new Primitives())
          .installPrimitivesIn(this);
      } else if (displayWarning) {
        universe.println(`Primitives class ${this.name.getString()} not found`);
      }
    } catch (Error) {
      // NO OP, class does not have primitive
    }
  }

  toString() {
    return `Class(${this.name.getString()})`;
  }
}
