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
import { Frame } from '../interpreter/Frame.js';
import { universe } from '../vm/Universe.js';

class SInvokable extends SAbstractObject {
  constructor(signature, holder) {
    super();
    this.holder = holder;
    this.signature = signature;
  }

  getHolder() {
    return this.holder;
  }

  setHolder(value) {
    this.holder = value;
  }

  getSignature() {
    return this.signature;
  }

  getNumberOfArguments() {
    return this.signature.getNumberOfSignatureArguments();
  }
}

export class SMethod extends SInvokable {
  constructor(signature, sourceSection, bodyNode, numberOfTemps) {
    super(signature, null);
    this.sourceSection = sourceSection;
    this.bodyNode = bodyNode;
    this.numberOfTemps = numberOfTemps;
  }

  getClass() {
    return universe.methodClass;
  }

  isPrimitive() {
    return false;
  }

  invoke(frame, args) {
    const newFrame = new Frame(args, this.numberOfTemps);
    return this.bodyNode.execute(newFrame, args);
  }

  toString() {
    const holder = this.holder;
    if (holder == null) {
      return `Method(nil>>${this.signature.toString()})`;
    }

    return `Method(${holder.getName().getString()}>>${
      this.signature.toString()})`;
  }
}

export class SPrimitive extends SInvokable {
  constructor(signature, primFun, holder) {
    super(signature, holder);
    this.primFun = primFun;
  }

  getClass() {
    return universe.primitiveClass;
  }

  isPrimitive() {
    return true;
  }

  invoke(frame, args) {
    return this.primFun(frame, args);
  }

  toString() {
    const holder = this.holder;
    if (holder == null) {
      return `Primitive(nil>>${this.signature.toString()})`;
    }

    return `Primitive(${holder.getName().getString()}>>${
      this.signature.toString()})`;
  }
}
