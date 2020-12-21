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

import { ContextualNode } from './ContextualNode.js';

export class VariableReadNode extends ContextualNode {
  constructor(contextLevel, local, source) {
    super(contextLevel, source);
    this.local = local;
  }

  execute(frame) {
    const ctx = this.determineContext(frame);
    return ctx.getTemp(this.local.getIndex());
  }
}

export class VariableWriteNode extends ContextualNode {
  constructor(contextLevel, local, valueExpr, source) {
    super(contextLevel, source);
    this.child_value = this.adopt(valueExpr);
    this.local = local;
  }

  execute(frame) {
    const val = this.child_value.execute(frame);

    const ctx = this.determineContext(frame);
    ctx.setTemp(this.local.getIndex(), val);
    return val;
  }
}
