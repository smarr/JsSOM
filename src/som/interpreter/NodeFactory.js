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

import { ArgumentReadNode, ArgumentWriteNode, SuperReadNode } from './ArgumentNode.js';
import { BlockNode } from './BlockNode.js';
import { MessageSendNode } from './MessageSendNode.js';
import { UninitializedGlobalReadNode } from './GlobalReadNode.js';
import { LiteralNode } from './LiteralNode.js';
import { ReturnNonLocalNode, CatchNonLocalReturnNode } from './ReturnNonLocalNode.js';
import { SequenceNode } from './SequenceNode.js';
import { FieldReadNode, FieldWriteNode } from './FieldNode.js';
import { VariableReadNode, VariableWriteNode } from './VariableNode.js';

import { SSymbol } from '../vmobjects/SSymbol.js';

export function createCatchNonLocalReturn(methodBody) {
  return new CatchNonLocalReturnNode(methodBody);
}

export function createFieldRead(self, fieldIndex, source) {
  return new FieldReadNode(self, fieldIndex, source);
}

export function createGlobalRead(name, source) {
  assert(name instanceof SSymbol);
  return new UninitializedGlobalReadNode(name, source);
}

export function createFieldWrite(self, exp, fieldIndex, source) {
  return new FieldWriteNode(self, exp, fieldIndex, source);
}

export function createArgumentRead(arg, contextLevel, source) {
  return new ArgumentReadNode(contextLevel, arg, source);
}

export function createArgumentWrite(arg, contextLevel, exp, source) {
  return new ArgumentWriteNode(contextLevel, arg, exp, source);
}

export function createVariableRead(local, contextLevel, source) {
  return new VariableReadNode(contextLevel, local, source);
}

export function createSuperRead(variable, contextLevel, holderClass, classSide, source) {
  assert(holderClass instanceof SSymbol);
  return new SuperReadNode(
    holderClass, classSide, contextLevel, variable, source,
  );
}

export function createVariableWrite(variable, contextLevel, exp, source) {
  return new VariableWriteNode(contextLevel, variable, exp, source);
}

export function createSequence(exps, source) {
  return new SequenceNode(exps, source);
}

export function createBlockNode(blockMethod, source) {
  return new BlockNode(blockMethod, source);
}

export function createMessageSend(msg, exprs, source) {
  return new MessageSendNode(msg, exprs, source);
}

export function createNonLocalReturn(exp, contextLevel, source) {
  return new ReturnNonLocalNode(exp, contextLevel, source);
}

export function createLiteralNode(somVal, source) {
  return new LiteralNode(somVal, source);
}
