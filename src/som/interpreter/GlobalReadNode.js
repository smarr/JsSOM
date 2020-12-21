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
import { universe } from '../vm/Universe.js';

export class UninitializedGlobalReadNode extends Node {
  constructor(globalName, source) {
    super(source);
    this.globalName = globalName;
  }

  executeUnknownGlobal(frame) {
    const self = frame.getReceiver();
    return self.sendUnknownGlobal(this.globalName, frame);
  }

  execute(frame) {
    // Get the global from the universe
    const assoc = universe.getGlobalsAssociation(this.globalName);
    if (assoc != null) {
      // eslint-disable-next-line no-use-before-define
      return this.replace(new CachedGlobalReadNode(assoc, this.source))
        .execute(frame);
    }
    return this.executeUnknownGlobal(frame);
  }
}

class CachedGlobalReadNode extends Node {
  constructor(assoc, source) {
    super(source);
    this.assoc = assoc;
  }

  execute(_frame) {
    return this.assoc.getValue();
  }
}
