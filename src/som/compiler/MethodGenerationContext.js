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

import { IllegalStateException } from '../../lib/exceptions.js';

import { Local, Argument } from './Variable.js';
import { SourceSection } from './SourceSection.js';

import * as factory from '../interpreter/NodeFactory.js';
import { constructEmptyPrimitive } from '../primitives/Primitives.js';

import { universe } from '../vm/Universe.js';

export class MethodGenerationContext {
  constructor(holderGenc, outerGenc, blockMethod) {
    this.holderGenc = holderGenc;
    this.outerGenc = outerGenc;
    this.blockMethod = blockMethod;

    this.signature = null;
    this.primitive = false;
    this._needsToCatchNonLocalReturn = false;
    this.throwsNonLocalReturn = false;
    this.args = [];
    this.argNames = [];
    this.locals = [];
    this.localNames = [];
  }

  makeCatchNonLocalReturn() {
    this.throwsNonLocalReturn = true;

    const ctx = this.getOuterContext();
    ctx.markToCatchNonLocalReturn();
  }

  markToCatchNonLocalReturn() {
    this._needsToCatchNonLocalReturn = true;
  }

  getOuterContext() {
    if (this.outerGenc == null) {
      return this;
    }
    return this.outerGenc.getOuterContext();
  }

  needsToCatchNonLocalReturn() {
    // only the most outer method needs to catch
    return this._needsToCatchNonLocalReturn && this.outerGenc == null;
  }

  assemble(body, sourceSection) {
    if (this.primitive) {
      return constructEmptyPrimitive(this.signature);
    }

    if (this._needsToCatchNonLocalReturn) {
      body = factory.createCatchNonLocalReturn(body);
    }

    // return the method - the holder field is to be set later on!
    return universe.newMethod(this.signature,
      this.getSourceSectionForMethod(sourceSection),
      body, this.locals.length);
  }

  getSourceSectionForMethod(ssBody) {
    return new SourceSection(
      `${this.holderGenc.getName().getString()}>>${this.signature.toString()}`,
      ssBody.startLine(), ssBody.startColumn(),
      ssBody.charIndex(), ssBody.length(),
    );
  }

  markAsPrimitive() {
    this.primitive = true;
  }

  setSignature(sig) {
    this.signature = sig;
  }

  addArgument(arg) {
    if ((arg === 'self' || arg === '$blockSelf') && this.args.length > 0) {
      throw new IllegalStateException('The self argument always has to be the first argument of a method');
    }

    const argument = new Argument(arg, this.args.length);
    this.args.push(argument);
    this.argNames.push(arg);
  }

  addArgumentIfAbsent(arg) {
    if (this.argNames.indexOf(arg) !== -1) {
      return;
    }
    this.addArgument(arg);
  }

  addLocalIfAbsent(local) {
    if (this.localNames.indexOf(local) !== -1) {
      return;
    }
    this.addLocal(local);
  }

  addLocal(local) {
    const l = new Local(local, this.locals.length);
    this.locals.push(l);
    this.localNames.push(local);
  }

  isBlockMethod() {
    return this.blockMethod;
  }

  getHolder() {
    return this.holderGenc;
  }

  getOuterSelfContextLevel() {
    if (this.outerGenc === null) {
      return 0;
    }
    return this.outerGenc.getOuterSelfContextLevel() + 1;
  }

  getContextLevel(varName) {
    if (this.localNames.indexOf(varName) !== -1
            || this.argNames.indexOf(varName) !== -1) {
      return 0;
    }

    if (this.outerGenc != null) {
      return 1 + this.outerGenc.getContextLevel(varName);
    }
    return 0;
  }

  getVariable(varName) {
    let i = this.localNames.indexOf(varName);
    if (i !== -1) {
      return this.locals[i];
    }

    i = this.argNames.indexOf(varName);
    if (i !== -1) {
      return this.args[i];
    }

    if (this.outerGenc !== null) {
      return this.outerGenc.getVariable(varName);
    }
    return null;
  }

  getSuperReadNode(source) {
    const self = this.getVariable('self');
    return self.getSuperReadNode(
      this.getOuterSelfContextLevel(),
      this.holderGenc.getName(), this.holderGenc.isClassSide(), source,
    );
  }

  getLocalReadNode(variableName, source) {
    const variable = this.getVariable(variableName);
    return variable.getReadNode(this.getContextLevel(variableName), source);
  }

  getLocalWriteNode(variableName, valExpr, source) {
    const variable = this.getVariable(variableName);
    return variable.getWriteNode(this.getContextLevel(variableName),
      valExpr, source);
  }

  getNonLocalReturn(expr, source) {
    this.makeCatchNonLocalReturn();
    return factory.createNonLocalReturn(
      expr, this.getOuterSelfContextLevel(), source,
    );
  }

  getSelfRead(source) {
    return this.getVariable('self').getReadNode(
      this.getContextLevel('self'), source,
    );
  }

  getObjectFieldRead(fieldName, source) {
    if (!this.holderGenc.hasField(fieldName)) {
      return null;
    }
    return factory.createFieldRead(this.getSelfRead(source),
      this.holderGenc.getFieldIndex(fieldName), source);
  }

  getGlobalRead(varName, source) {
    return factory.createGlobalRead(varName, source);
  }

  getObjectFieldWrite(fieldName, exp, source) {
    if (!this.holderGenc.hasField(fieldName)) {
      return null;
    }

    return factory.createFieldWrite(this.getSelfRead(source), exp,
      this.holderGenc.getFieldIndex(fieldName), source);
  }

  /**
     * @returns {Number} of explicit arguments,
     *         i.e., excluding the implicit 'self' argument
     */
  getNumberOfArguments() {
    return this.args.length;
  }

  getSignature() {
    return this.signature;
  }

  toString() {
    return `MethodGenC(${this.holderGenc.getName().getString()}>>${this.signature.toString()})`;
  }
}
