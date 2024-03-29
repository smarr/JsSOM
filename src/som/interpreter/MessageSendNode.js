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

import { Node } from './Node.js';
import { GenericDispatchNode, UninitializedSuperDispatchNode } from './DispatchNode.js';

export class MessageSendNode extends Node {
  constructor(selector, argumentNodes, source) {
    super(source);
    this.selector = selector;
    this.children_arguments = this.adopt(argumentNodes);

    if (argumentNodes[0].isSuperNode()) {
      this.child_dispatch = this.adopt(new UninitializedSuperDispatchNode(
        selector,
        argumentNodes[0].getHolderClass(),
        argumentNodes[0].isClassSide(),
      ));
    } else {
      this.child_dispatch = this.adopt(new GenericDispatchNode(selector));
    }
  }

  execute(frame) {
    const args = this.evaluateArguments(frame);
    return this.child_dispatch.executeDispatch(frame, args);
  }

  evaluateArguments(frame) {
    const args = new Array(this.children_arguments.length);
    for (let i = 0; i < this.children_arguments.length; i += 1) {
      args[i] = this.children_arguments[i].execute(frame);
      assert(args[i] != null);
    }
    return args;
  }

  toString() {
    return `MsgSend(${this.selector.getString()})`;
  }
}
