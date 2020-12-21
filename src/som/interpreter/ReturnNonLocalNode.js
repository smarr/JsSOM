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

import { Node } from './Node.js';
import { ContextualNode } from './ContextualNode.js';

export class ReturnException {
  constructor(result, targetFrame) {
    this.result = result;
    this.targetFrame = targetFrame;
  }

  hasReachedTarget(current) { return current === this.targetFrame; }

  getResult() { return this.result; }
}

export class ReturnNonLocalNode extends ContextualNode {
  constructor(exp, contextLevel, source) {
    super(contextLevel, source);
    this.child_exp = this.adopt(exp);
  }

  execute(frame) {
    const result = this.child_exp.execute(frame);

    const ctx = this.determineContext(frame);
    if (ctx.isOnStack()) {
      throw new ReturnException(result, ctx);
    } else {
      const outerReceiver = ctx.getReceiver();
      return outerReceiver.sendEscapedBlock(frame.getReceiver(), frame);
    }
  }
}

export class CatchNonLocalReturnNode extends Node {
  constructor(body) {
    super(null);
    this.child_body = this.adopt(body);
  }

  execute(frame) {
    try {
      return this.child_body.execute(frame);
    } catch (e) {
      if (e instanceof ReturnException) {
        if (e.hasReachedTarget(frame)) {
          return e.getResult();
        }
      }
      throw e;
    } finally {
      frame.dropFromStack();
    }
  }
}
