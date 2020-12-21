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

import { RuntimeException } from '../../lib/exceptions.js';

import { Lexer } from './Lexer.js';
import { Sym } from './Symbol.js';
import { MethodGenerationContext } from './MethodGenerationContext.js';
import { SourceSection } from './SourceSection.js';

import {
  createGlobalRead, createSequence, createBlockNode, createMessageSend, createLiteralNode,
} from '../interpreter/NodeFactory.js';

import { universe } from '../vm/Universe.js';

import { intOrBigInt } from '../../lib/platform.js';

function isIdentifier(sym) {
  return sym === Sym.Identifier || sym === Sym.Primitive;
}

function printableSymbol(sym) {
  return sym === Sym.Integer || sym === Sym.Double || sym >= Sym.STString;
}

class ParseError {
  constructor(message, expected, parser) {
    this.message = message;
    this.expected = expected;

    this.sourceCoordinate = parser.getCoordinate();
    this.text = parser.getText();
    this.currentLine = parser.getLexer().getCurrentLine();
    this.fileName = parser.getFileName();
    this.found = parser.getSym();
  }

  expectedSymbolAsString() {
    return Sym.toString(this.expected);
  }

  toString() {
    let msg = `%(file)s:%(line)d:%(column)d: error: ${this.message}`;
    let foundStr;
    if (printableSymbol(this.found)) {
      foundStr = `${Sym.toString(this.found)} (${this.text})`;
    } else {
      foundStr = Sym.toString(this.found);
    }
    msg += `: ${this.currentLine}`;
    const expectedStr = this.expectedSymbolAsString();

    msg = msg.replace('%(file)s', this.fileName);
    msg = msg.replace('%(line)d', this.sourceCoordinate.startLine);
    msg = msg.replace('%(column)d', this.sourceCoordinate.startColumn);
    msg = msg.replace('%(expected)s', expectedStr);
    msg = msg.replace('%(found)s', foundStr);
    return msg;
  }
}

class ParseErrorWithSymbolList extends ParseError {
  expectedSymbolAsString() {
    let sb = '';
    let deliminator = '';

    for (const s of this.expected) {
      sb += deliminator;
      sb += s;
      deliminator = ', ';
    }
    return sb;
  }
}

const singleOpSyms = [Sym.Not, Sym.And, Sym.Or, Sym.Star, Sym.Div,
  Sym.Mod, Sym.Plus, Sym.Equal, Sym.More, Sym.Less,
  Sym.Comma, Sym.At, Sym.Per, Sym.NONE];

const binaryOpSyms = [Sym.Or, Sym.Comma, Sym.Minus, Sym.Equal, Sym.Not,
  Sym.And, Sym.Or, Sym.Star, Sym.Div, Sym.Mod,
  Sym.Plus, Sym.Equal, Sym.More, Sym.Less, Sym.Comma,
  Sym.At, Sym.Per, Sym.NONE];

const keywordSelectorSyms = [Sym.Keyword, Sym.KeywordSequence];

export class Parser {
  constructor(fileContent, fileName) {
    this.fileName = fileName;
    this.lexer = new Lexer(fileContent);
    this.sym = Sym.NONE;
    this.text = null;
    this.nextSym = Sym.NONE;
    this.lastMethodsSourceSection = null;

    this.getSymbolFromLexer();
  }

  getText() {
    return this.text;
  }

  getLexer() {
    return this.lexer;
  }

  getFileName() {
    return this.fileName;
  }

  getSym() {
    return this.sym;
  }

  toString() {
    return `Parser(${this.fileName}, ${
      this.getCoordinate().toString()})`;
  }

  getCoordinate() {
    return this.lexer.getStartCoordinate();
  }

  classdef(cgenc) {
    cgenc.setName(universe.symbolFor(this.text));
    this.expect(Sym.Identifier);
    this.expect(Sym.Equal);

    this.superclass(cgenc);

    this.expect(Sym.NewTerm);
    this.instanceFields(cgenc);

    while (isIdentifier(this.sym) || this.sym === Sym.Keyword
            || this.sym === Sym.OperatorSequence || this.symIn(binaryOpSyms)) {
      const mgenc = new MethodGenerationContext(cgenc, null, false);
      const methodBody = this.method(mgenc);
      cgenc.addInstanceMethod(
        mgenc.assemble(methodBody, this.lastMethodsSourceSection),
      );
    }

    if (this.accept(Sym.Separator)) {
      cgenc.setClassSide(true);
      this.classFields(cgenc);
      while (isIdentifier(this.sym) || this.sym === Sym.Keyword
                || this.sym === Sym.OperatorSequence || this.symIn(binaryOpSyms)) {
        const mgenc = new MethodGenerationContext(cgenc, null, false);
        const methodBody = this.method(mgenc);
        cgenc.addClassMethod(
          mgenc.assemble(methodBody, this.lastMethodsSourceSection),
        );
      }
    }
    this.expect(Sym.EndTerm);
  }

  superclass(cgenc) {
    let superName;
    if (this.sym === Sym.Identifier) {
      superName = universe.symbolFor(this.text);
      this.accept(Sym.Identifier);
    } else {
      superName = universe.symbolFor('Object');
    }
    cgenc.setSuperName(superName);

    // Load the super class, if it is not nil (break the dependency cycle)
    if (superName.getString() !== 'nil') {
      const superClass = universe.loadClass(superName);
      if (superClass === null) {
        throw new ParseError(`Super class ${superName.getString()
        } could not be loaded`, Sym.NONE, this);
      }

      cgenc.setInstanceFieldsOfSuper(superClass.getInstanceFields());
      cgenc.setClassFieldsOfSuper(superClass.getClass().getInstanceFields());
    }
  }

  symIn(ss) {
    return ss.indexOf(this.sym) !== -1;
  }

  accept(s) {
    if (this.sym === s) {
      this.getSymbolFromLexer();
      return true;
    }
    return false;
  }

  acceptOneOf(ss) {
    if (this.symIn(ss)) {
      this.getSymbolFromLexer();
      return true;
    }
    return false;
  }

  expect(s) {
    if (this.accept(s)) { return true; }

    throw new ParseError('Unexpected symbol. Expected %(expected)s, but found '
            + '%(found)s', s, this);
  }

  expectOneOf(ss) {
    if (this.acceptOneOf(ss)) { return true; }

    throw new ParseErrorWithSymbolList('Unexpected symbol. Expected one of '
            + '%(expected)s, but found %(found)s', ss, this);
  }

  instanceFields(cgenc) {
    if (this.accept(Sym.Or)) {
      while (isIdentifier(this.sym)) {
        const v = this.variable();
        cgenc.addInstanceField(universe.symbolFor(v));
      }
      this.expect(Sym.Or);
    }
  }

  classFields(cgenc) {
    if (this.accept(Sym.Or)) {
      while (isIdentifier(this.sym)) {
        const v = this.variable();
        cgenc.addClassField(universe.symbolFor(v));
      }
      this.expect(Sym.Or);
    }
  }

  getSource(coord) {
    return new SourceSection(
      'method', coord.startLine, coord.startColumn, coord.charIndex,
      this.lexer.getNumberOfCharactersRead() - coord.charIndex,
    );
  }

  method(mgenc) {
    this.pattern(mgenc);
    this.expect(Sym.Equal);
    if (this.sym === Sym.Primitive) {
      mgenc.markAsPrimitive();
      this.primitiveBlock();
      return null;
    }
    return this.methodBlock(mgenc);
  }

  primitiveBlock() {
    this.expect(Sym.Primitive);
  }

  pattern(mgenc) {
    mgenc.addArgumentIfAbsent('self'); // TODO: can we do that optionally?
    switch (this.sym) {
      case Sym.Identifier:
      case Sym.Primitive:
        this.unaryPattern(mgenc);
        break;
      case Sym.Keyword:
        this.keywordPattern(mgenc);
        break;
      default:
        this.binaryPattern(mgenc);
        break;
    }
  }

  unaryPattern(mgenc) {
    mgenc.setSignature(this.unarySelector());
  }

  binaryPattern(mgenc) {
    mgenc.setSignature(this.binarySelector());
    mgenc.addArgumentIfAbsent(this.argument());
  }

  keywordPattern(mgenc) {
    let kw = '';
    do {
      kw += this.keyword();
      mgenc.addArgumentIfAbsent(this.argument());
    }
    while (this.sym === Sym.Keyword);

    mgenc.setSignature(universe.symbolFor(kw.toString()));
  }

  methodBlock(mgenc) {
    this.expect(Sym.NewTerm);
    const coord = this.getCoordinate();
    const methodBody = this.blockContents(mgenc);
    this.lastMethodsSourceSection = this.getSource(coord);
    this.expect(Sym.EndTerm);

    return methodBody;
  }

  unarySelector() {
    return universe.symbolFor(this.identifier());
  }

  binarySelector() {
    const s = this.text;

    if (this.accept(Sym.Or)) { /* noop */
    } else if (this.accept(Sym.Comma)) { /* noop */
    } else if (this.accept(Sym.Minus)) { /* noop */
    } else if (this.accept(Sym.Equal)) { /* noop */
    } else if (this.acceptOneOf(singleOpSyms)) { /* noop */
    } else if (this.accept(Sym.OperatorSequence)) { /* noop */
    } else { this.expect(Sym.NONE); }

    return universe.symbolFor(s);
  }

  identifier() {
    const s = this.text;
    const isPrimitive = this.accept(Sym.Primitive);
    if (!isPrimitive) {
      this.expect(Sym.Identifier);
    }
    return s;
  }

  keyword() {
    const s = this.text;
    this.expect(Sym.Keyword);
    return s;
  }

  argument() {
    return this.variable();
  }

  blockContents(mgenc) {
    if (this.accept(Sym.Or)) {
      this.locals(mgenc);
      this.expect(Sym.Or);
    }
    return this.blockBody(mgenc);
  }

  locals(mgenc) {
    while (isIdentifier(this.sym)) {
      mgenc.addLocalIfAbsent(this.variable());
    }
  }

  blockBody(mgenc) {
    const coord = this.getCoordinate();
    const expressions = [];

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (this.accept(Sym.Exit)) {
        expressions.push(this.result(mgenc));
        return this.createSequenceNode(coord, expressions);
      } if (this.sym === Sym.EndBlock) {
        return this.createSequenceNode(coord, expressions);
      } if (this.sym === Sym.EndTerm) {
        // the end of the method has been found (EndTerm) - make it implicitly
        // return "self"
        const self = this.variableRead(mgenc, 'self', this.getSource(this.getCoordinate()));
        expressions.push(self);
        return this.createSequenceNode(coord, expressions);
      }

      expressions.push(this.expression(mgenc));
      this.accept(Sym.Period);
    }
  }

  createSequenceNode(coord, expressions) {
    if (expressions.length === 0) {
      return createGlobalRead(universe.symbolFor('nil'), this.getSource(coord));
    } if (expressions.length === 1) {
      return expressions[0];
    }
    return createSequence(expressions.slice(), this.getSource(coord));
  }

  result(mgenc) {
    const coord = this.getCoordinate();
    const exp = this.expression(mgenc);
    this.accept(Sym.Period);

    if (mgenc.isBlockMethod()) {
      return mgenc.getNonLocalReturn(exp, this.getSource(coord));
    }
    return exp;
  }

  expression(mgenc) {
    this.peekForNextSymbolFromLexer();

    if (this.nextSym === Sym.Assign) {
      return this.assignation(mgenc);
    }
    return this.evaluation(mgenc);
  }

  assignation(mgenc) {
    return this.assignments(mgenc);
  }

  assignments(mgenc) {
    const coord = this.getCoordinate();

    if (!isIdentifier(this.sym)) {
      throw new ParseError('Assignments should always target variables or'
                + ' fields, but found instead a %(found)s',
      Sym.Identifier, this);
    }
    const variable = this.assignment();

    this.peekForNextSymbolFromLexer();

    let value;
    if (this.nextSym === Sym.Assign) {
      value = this.assignments(mgenc);
    } else {
      value = this.evaluation(mgenc);
    }

    return this.variableWrite(mgenc, variable, value, this.getSource(coord));
  }

  assignment() {
    const v = this.variable();
    this.expect(Sym.Assign);
    return v;
  }

  evaluation(mgenc) {
    let exp = this.primary(mgenc);
    if (isIdentifier(this.sym) || this.sym === Sym.Keyword
            || this.sym === Sym.OperatorSequence || this.symIn(binaryOpSyms)) {
      exp = this.messages(mgenc, exp);
    }
    return exp;
  }

  primary(mgenc) {
    switch (this.sym) {
      case Sym.Identifier:
      case Sym.Primitive: {
        const coord = this.getCoordinate();
        const v = this.variable();
        return this.variableRead(mgenc, v, this.getSource(coord));
      }
      case Sym.NewTerm: {
        return this.nestedTerm(mgenc);
      }
      case Sym.NewBlock: {
        const coord = this.getCoordinate();
        const bgenc = new MethodGenerationContext(mgenc.getHolder(), mgenc, true);
        const blockBody = this.nestedBlock(bgenc);
        const blockMethod = bgenc.assemble(blockBody, this.lastMethodsSourceSection);

        return createBlockNode(blockMethod, this.getSource(coord));
      }
      default: {
        return this.literal();
      }
    }
  }

  variable() {
    return this.identifier();
  }

  messages(mgenc, receiver) {
    let msg;
    if (isIdentifier(this.sym)) {
      msg = this.unaryMessage(receiver);

      while (isIdentifier(this.sym)) {
        msg = this.unaryMessage(msg);
      }

      while (this.sym === Sym.OperatorSequence || this.symIn(binaryOpSyms)) {
        msg = this.binaryMessage(mgenc, msg);
      }

      if (this.sym === Sym.Keyword) {
        msg = this.keywordMessage(mgenc, msg);
      }
    } else if (this.sym === Sym.OperatorSequence || this.symIn(binaryOpSyms)) {
      msg = this.binaryMessage(mgenc, receiver);

      while (this.sym === Sym.OperatorSequence || this.symIn(binaryOpSyms)) {
        msg = this.binaryMessage(mgenc, msg);
      }

      if (this.sym === Sym.Keyword) {
        msg = this.keywordMessage(mgenc, msg);
      }
    } else {
      msg = this.keywordMessage(mgenc, receiver);
    }
    return msg;
  }

  unaryMessage(receiver) {
    const coord = this.getCoordinate();
    const selector = this.unarySelector();
    return createMessageSend(
      selector, [receiver], this.getSource(coord),
    );
  }

  binaryMessage(mgenc, receiver) {
    const coord = this.getCoordinate();
    const msg = this.binarySelector();
    const operand = this.binaryOperand(mgenc);

    return createMessageSend(
      msg, [receiver, operand], this.getSource(coord),
    );
  }

  binaryOperand(mgenc) {
    let operand = this.primary(mgenc);

    // a binary operand can receive unaryMessages
    // Example: 2 * 3 asString
    //   is evaluated as 2 * (3 asString)
    while (isIdentifier(this.sym)) {
      operand = this.unaryMessage(operand);
    }
    return operand;
  }

  keywordMessage(mgenc, receiver) {
    const coord = this.getCoordinate();
    const args = [];
    let kw = '';

    args.push(receiver);

    do {
      kw += this.keyword();
      args.push(this.formula(mgenc));
    }
    while (this.sym === Sym.Keyword);

    const msg = universe.symbolFor(kw);

    return createMessageSend(
      msg, args.slice(), this.getSource(coord),
    );
  }

  formula(mgenc) {
    let operand = this.binaryOperand(mgenc);

    while (this.sym === Sym.OperatorSequence || this.symIn(binaryOpSyms)) {
      operand = this.binaryMessage(mgenc, operand);
    }
    return operand;
  }

  nestedTerm(mgenc) {
    this.expect(Sym.NewTerm);
    const exp = this.expression(mgenc);
    this.expect(Sym.EndTerm);
    return exp;
  }

  getObjectForCurrentLiteral() {
    switch (this.sym) {
      case Sym.Pound: {
        this.peekForNextSymbolFromLexerIfNecessary();
        if (this.nextSym === Sym.NewTerm) {
          return this.literalArray();
        }
        return this.literalSymbol();
      }
      case Sym.STString:
        return this.literalString();
      default:
        return this.literalNumber();
    }
  }

  literal() {
    const coord = this.getCoordinate();
    const value = this.getObjectForCurrentLiteral();
    const source = this.getSource(coord);
    return createLiteralNode(value, source);
  }

  literalNumber() {
    if (this.sym === Sym.Minus) {
      return this.negativeDecimal();
    }
    return this.literalDecimal(false);
  }

  literalDecimal(isNegative) {
    if (this.sym === Sym.Integer) {
      return this.literalInteger(isNegative);
    }
    return this.literalDouble(isNegative);
  }

  negativeDecimal() {
    this.expect(Sym.Minus);
    return this.literalDecimal(true);
  }

  isNegativeNumber() {
    let isNegative = false;
    if (this.sym === Sym.Minus) {
      this.expect(Sym.Minus);
      isNegative = true;
    }
    return isNegative;
  }

  literalInteger(isNegative) {
    let i;

    try {
      i = BigInt(this.text);
    } catch (e) {
      throw new ParseError(`${'Could not parse integer. Expected a number '
                + "but got '"}${this.text}'`, Sym.NONE, this);
    }

    if (isNegative) {
      i = 0n - i;
    }
    this.expect(Sym.Integer);

    return intOrBigInt(i, universe);
  }

  literalDouble(isNegative) {
    let d = parseFloat(this.text);
    if (Number.isNaN(d)) {
      throw new ParseError(`${'Could not parse double. Expected a number '
                + "but got '"}${this.text}'`, Sym.NONE, this);
    }

    if (isNegative) {
      d = 0.0 - d;
    }
    this.expect(Sym.Double);
    return universe.newDouble(d);
  }

  literalSymbol() {
    this.expect(Sym.Pound);
    if (this.sym === Sym.STString) {
      const s = this.string();
      return universe.symbolFor(s);
    }
    return this.selector();
  }

  literalString() {
    const s = this.string();
    return universe.newString(s);
  }

  literalArray() {
    const literals = [];
    this.expect(Sym.Pound);
    this.expect(Sym.NewTerm);

    while (this.sym !== Sym.EndTerm) {
      literals.push(this.getObjectForCurrentLiteral());
    }

    this.expect(Sym.EndTerm);
    return universe.newArrayFrom(literals);
  }

  selector() {
    if (this.sym === Sym.OperatorSequence || this.symIn(singleOpSyms)) {
      return this.binarySelector();
    } if (this.sym === Sym.Keyword || this.sym === Sym.KeywordSequence) {
      return this.keywordSelector();
    }
    return this.unarySelector();
  }

  keywordSelector() {
    const s = this.text;
    this.expectOneOf(keywordSelectorSyms);
    return universe.symbolFor(s);
  }

  string() {
    const s = this.text;
    this.expect(Sym.STString);
    return s;
  }

  nestedBlock(mgenc) {
    this.expect(Sym.NewBlock);
    const coord = this.getCoordinate();

    mgenc.addArgumentIfAbsent('$blockSelf');

    if (this.sym === Sym.Colon) {
      this.blockPattern(mgenc);
    }

    // generate Block signature
    let blockSig = `$blockMethod@${this.lexer.getCurrentLineNumber()}@${this.lexer.getCurrentColumn()}`;
    const argSize = mgenc.getNumberOfArguments();
    for (let i = 1; i < argSize; i += 1) {
      blockSig += ':';
    }

    mgenc.setSignature(universe.symbolFor(blockSig));

    const expressions = this.blockContents(mgenc);

    this.lastMethodsSourceSection = this.getSource(coord);

    this.expect(Sym.EndBlock);

    return expressions;
  }

  blockPattern(mgenc) {
    this.blockArguments(mgenc);
    this.expect(Sym.Or);
  }

  blockArguments(mgenc) {
    do {
      this.expect(Sym.Colon);
      mgenc.addArgumentIfAbsent(this.argument());
    }
    while (this.sym === Sym.Colon);
  }

  variableRead(mgenc, variableName, source) {
    // we need to handle super special here
    if (variableName === 'super') {
      return mgenc.getSuperReadNode(source);
    }

    // now look up first local variables, or method arguments
    const variable = mgenc.getVariable(variableName);
    if (variable !== null) {
      return mgenc.getLocalReadNode(variableName, source);
    }

    // then object fields
    const varName = universe.symbolFor(variableName);
    const fieldRead = mgenc.getObjectFieldRead(varName, source);

    if (fieldRead !== null) {
      return fieldRead;
    }

    // and finally assume it is a global
    return mgenc.getGlobalRead(varName, source);
  }

  variableWrite(mgenc, variableName, exp, source) {
    const variable = mgenc.getVariable(variableName);
    if (variable !== null) {
      return mgenc.getLocalWriteNode(variableName, exp, source);
    }

    const fieldName = universe.symbolFor(variableName);
    const fieldWrite = mgenc.getObjectFieldWrite(fieldName, exp, source);

    if (fieldWrite !== null) {
      return fieldWrite;
    }
    throw new RuntimeException(`${'Neither a variable nor a field found '
                + 'in current scope that is named '}${variableName
    }. Arguments are read-only.`);
  }

  getSymbolFromLexer() {
    this.sym = this.lexer.getSym();
    this.text = this.lexer.getText();
  }

  peekForNextSymbolFromLexer() {
    this.nextSym = this.lexer.peek();
  }

  peekForNextSymbolFromLexerIfNecessary() {
    if (!this.lexer.getPeekDone()) {
      this.peekForNextSymbolFromLexer();
    }
  }
}
