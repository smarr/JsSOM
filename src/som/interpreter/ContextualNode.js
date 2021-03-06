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

export class ContextualNode extends Node {
  constructor(contextLevel, source) {
    super(source);
    this.contextLevel = contextLevel;
  }

  getContextLevel() {
    return this.contextLevel;
  }

  determineContext(frame) {
    if (this.contextLevel === 0) { return frame; }

    let self = frame.getReceiver();
    let i = this.contextLevel - 1;

    while (i > 0) {
      self = self.getOuterSelf();
      i -= 1;
    }
    return self.getContext();
  }

  determineOuterSelf(frame) {
    let self = frame.getReceiver();
    let i = this.contextLevel;
    while (i > 0) {
      self = self.getOuterSelf();
      i -= 1;
    }
    return self;
  }
}
