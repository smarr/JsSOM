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
//@ts-check
"use strict";
const assert = require('../../lib/assert').assert;

const ArgumentReadNode = require('./ArgumentNode').ArgumentReadNode;
const ArgumentWriteNode = require('./ArgumentNode').ArgumentWriteNode;
const SuperReadNode = require('./ArgumentNode').SuperReadNode;
const BlockNode = require('./BlockNode').BlockNode;
const MessageSendNode = require('./MessageSendNode').MessageSendNode;
const UninitializedGlobalReadNode = require('./GlobalReadNode').UninitializedGlobalReadNode;
const LiteralNode = require('./LiteralNode').LiteralNode;
const ReturnNonLocalNode = require('./ReturnNonLocalNode').ReturnNonLocalNode;
const CatchNonLocalReturnNode = require('./ReturnNonLocalNode').CatchNonLocalReturnNode;
const SequenceNode = require('./SequenceNode').SequenceNode;
const FieldReadNode = require('./FieldNode').FieldReadNode;
const FieldWriteNode = require('./FieldNode').FieldWriteNode;
const VariableReadNode = require('./VariableNode').VariableReadNode;
const VariableWriteNode = require('./VariableNode').VariableWriteNode;

const SSymbol = require('../vmobjects/SSymbol').SSymbol;

function createCatchNonLocalReturn(methodBody) {
    return new CatchNonLocalReturnNode(methodBody);
}

function createFieldRead(self, fieldIndex, source) {
    return new FieldReadNode(self, fieldIndex, source);
}

function createGlobalRead(name, source) {
    assert(name instanceof SSymbol);
    return new UninitializedGlobalReadNode(name, source);
}

function createFieldWrite(self, exp, fieldIndex, source) {
    return new FieldWriteNode(self, exp, fieldIndex, source);
}

function createArgumentRead(arg, contextLevel, source) {
    return new ArgumentReadNode(contextLevel, arg, source);
}

function createArgumentWrite(arg, contextLevel, exp, source) {
    return new ArgumentWriteNode(contextLevel, arg, exp, source);
}

function createVariableRead(local, contextLevel, source) {
    return new VariableReadNode(contextLevel, local, source);
}

function createSuperRead(variable, contextLevel, holderClass, classSide, source) {
    assert(holderClass instanceof SSymbol);
    return new SuperReadNode(
        holderClass, classSide, contextLevel, variable, source);
}

function createVariableWrite(variable, contextLevel, exp, source) {
    return new VariableWriteNode(contextLevel, variable, exp, source);
}

function createSequence(exps, source) {
    return new SequenceNode(exps, source);
}

function createBlockNode(blockMethod, source) {
    return new BlockNode(blockMethod, source);
}

function createMessageSend(msg, exprs, source) {
    return new MessageSendNode(msg, exprs, source);
}

function createNonLocalReturn(exp, contextLevel, source) {
    return new ReturnNonLocalNode(exp, contextLevel, source);
}

function createLiteralNode(somVal, source) {
    return new LiteralNode(somVal, source);
}

exports.createArgumentRead = createArgumentRead;
exports.createCatchNonLocalReturn = createCatchNonLocalReturn;
exports.createFieldRead = createFieldRead;
exports.createFieldWrite = createFieldWrite;
exports.createGlobalRead = createGlobalRead;
exports.createArgumentWrite = createArgumentWrite;
exports.createSuperRead = createSuperRead;
exports.createVariableRead = createVariableRead;
exports.createVariableWrite = createVariableWrite;
exports.createSequence = createSequence;
exports.createBlockNode = createBlockNode;
exports.createMessageSend = createMessageSend;
exports.createNonLocalReturn = createNonLocalReturn;
exports.createLiteralNode = createLiteralNode;
