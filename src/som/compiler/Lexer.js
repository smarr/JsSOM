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

import { Sym } from './Symbol.js';
import { IllegalStateException } from '../../lib/exceptions.js';

function isIdentifierChar(c) {
  return /[A-Za-z\d]/.test(c) || c === '_';
}

export function isOperator(c) {
  return c === '~' || c === '&' || c === '|' || c === '*' || c === '/' || c === '@'
    || c === '+' || c === '-' || c === '=' || c === '>' || c === '<'
    || c === ',' || c === '%' || c === '\\' || c === '@';
}

class LexerState {
  constructor() {
    this.lineNumber = 0;
    this.charsRead = 0; // all characters read, excluding the current line
    this.line = '';
    this.linePos = 0;
    this.sym = null;
    this.text = '';
    this.startCoord = null;
  }

  set(sym, text) {
    this.sym = sym;
    this.text = text;
  }

  clone() {
    const newState = new LexerState();
    newState.lineNumber = this.lineNumber;
    newState.charsRead = this.charsRead;
    newState.line = this.line;
    newState.linePos = this.linePos;
    newState.sym = this.sym;
    newState.text = this.text;
    newState.startCoord = this.startCoord;
    return newState;
  }
}

const SEPARATOR = '----';
const PRIMITIVE = 'primitive';

class SourceCoordinate {
  constructor(startLine, startColumn, charIndex) {
    this._startLine = startLine;
    this._startColumn = startColumn;
    this._charIndex = charIndex;
  }

  get startLine() { return this._startLine; }

  get startColumn() { return this._startColumn; }

  get charIndex() { return this._charIndex; }

  toString() {
    return `SrcCoord(line: ${this._startLine}, col: ${this._startColumn})`;
  }
}

export class Lexer {
  constructor(fileContent) {
    this.peekDone = false;
    this.state = new LexerState();
    this.stateAfterPeek = null;
    this.fileLines = fileContent.split('\n');
  }

  makeSourceCoordinate() {
    return new SourceCoordinate(
      this.state.lineNumber,
      this.state.linePos + 1,
      this.state.charsRead + this.state.linePos,
    );
  }

  getStartCoordinate() {
    return this.state.startCoord;
  }

  getPeekDone() {
    return this.peekDone;
  }

  getSym() {
    if (this.peekDone) {
      this.peekDone = false;
      this.state = this.stateAfterPeek;
      this.stateAfterPeek = null;
      return this.state.sym;
    }

    this.state.startCoord = this.makeSourceCoordinate();

    do {
      if (!this.hasMoreInput()) {
        this.state.set(Sym.NONE, '');
        return this.state.sym;
      }
      this.skipWhiteSpace();
      this.skipComment();
    }
    while (this.endOfLine() || /\s/.test(this.currentChar())
            || this.currentChar() === '"');

    if (this.currentChar() === '\'') {
      this.lexString();
    } else if (this.currentChar() === '[') {
      this.match(Sym.NewBlock);
    } else if (this.currentChar() === ']') {
      this.match(Sym.EndBlock);
    } else if (this.currentChar() === ':') {
      if (this.bufchar(this.state.linePos + 1) === '=') {
        this.state.linePos += 2;
        this.state.set(Sym.Assign, ':=');
      } else {
        this.state.linePos += 1;
        this.state.set(Sym.Colon, ':');
      }
    } else if (this.currentChar() === '(') {
      this.match(Sym.NewTerm);
    } else if (this.currentChar() === ')') {
      this.match(Sym.EndTerm);
    } else if (this.currentChar() === '#') {
      this.match(Sym.Pound);
    } else if (this.currentChar() === '^') {
      this.match(Sym.Exit);
    } else if (this.currentChar() === '.') {
      this.match(Sym.Period);
    } else if (this.currentChar() === '-') {
      if (this.state.line.indexOf(SEPARATOR, this.state.linePos) === this.state.linePos) {
        this.state.text = '';
        while (this.currentChar() === '-') {
          this.state.text += this.bufchar(this.state.linePos);
          this.state.linePos += 1;
        }
        this.state.sym = Sym.Separator;
      } else {
        this.lexOperator();
      }
    } else if (isOperator(this.currentChar())) {
      this.lexOperator();
    } else if (this.nextWordInBufferIs(PRIMITIVE)) {
      this.state.linePos += PRIMITIVE.length;
      this.state.set(Sym.Primitive, PRIMITIVE);
    } else if (/[A-Za-z]/.test(this.currentChar())) {
      this.state.set(Sym.Identifier, '');
      while (isIdentifierChar(this.currentChar())) {
        this.state.text += this.bufchar(this.state.linePos);
        this.state.linePos += 1;
      }
      if (this.bufchar(this.state.linePos) === ':') {
        this.state.sym = Sym.Keyword;
        this.state.linePos += 1;
        this.state.text += ':';
        if (/[A-Za-z]/.test(this.currentChar())) {
          this.state.sym = Sym.KeywordSequence;
          while (/[A-Za-z]/.test(this.currentChar()) || this.currentChar() === ':') {
            this.state.text += this.bufchar(this.state.linePos);
            this.state.linePos += 1;
          }
        }
      }
    } else if (/\d/.test(this.currentChar())) {
      this.lexNumber();
    } else {
      this.state.set(Sym.NONE, this.currentChar());
    }

    return this.state.sym;
  }

  lexNumber() {
    this.state.set(Sym.Integer, '');

    const sawDecimalMark = false;
    do {
      this.state.text += this.bufchar(this.state.linePos);
      this.state.linePos += 1;

      if (!sawDecimalMark
                && this.currentChar() === '.'
                && /\d/.test(this.bufchar(this.state.linePos + 1))) {
        this.state.sym = Sym.Double;
        this.state.text += this.bufchar(this.state.linePos);
        this.state.linePos += 1;
      }
    } while (/\d/.test(this.currentChar()));
  }

  lexEscapeChar() {
    const current = this.currentChar();

    switch (current) {
      case 't': this.state.text += '\t'; break;
      case 'b': this.state.text += '\b'; break;
      case 'n': this.state.text += '\n'; break;
      case 'r': this.state.text += '\r'; break;
      case 'f': this.state.text += '\f'; break;
      case '\'': this.state.text += "'"; break;
      case '\\': this.state.text += '\\'; break;
      case '0': this.state.text += '\0'; break;
      default:
        throw new Error(`Unsupported escape sequence \\${current}`);
    }
    this.state.linePos += 1;
  }

  lexStringChar() {
    if (this.currentChar() === '\\') {
      this.state.linePos += 1;
      this.lexEscapeChar();
    } else {
      this.state.text += this.currentChar();
      this.state.linePos += 1;
    }
  }

  lexString() {
    this.state.set(Sym.STString, '');
    this.state.linePos += 1;

    while (this.currentChar() !== '\'') {
      while (this.endOfLine()) {
        if (!this.readNextLine()) { return; }
        this.state.text += '\n';
      }
      if (this.currentChar() !== '\'') {
        this.lexStringChar();
      }
    }

    this.state.linePos += 1;
  }

  lexOperator() {
    if (isOperator(this.bufchar(this.state.linePos + 1))) {
      this.state.set(Sym.OperatorSequence, '');
      while (isOperator(this.currentChar())) {
        this.state.text += this.bufchar(this.state.linePos);
        this.state.linePos += 1;
      }
    } else if (this.currentChar() === '~') {
      this.match(Sym.Not);
    } else if (this.currentChar() === '&') {
      this.match(Sym.And);
    } else if (this.currentChar() === '|') {
      this.match(Sym.Or);
    } else if (this.currentChar() === '*') {
      this.match(Sym.Star);
    } else if (this.currentChar() === '/') {
      this.match(Sym.Div);
    } else if (this.currentChar() === '\\') {
      this.match(Sym.Mod);
    } else if (this.currentChar() === '+') {
      this.match(Sym.Plus);
    } else if (this.currentChar() === '=') {
      this.match(Sym.Equal);
    } else if (this.currentChar() === '>') {
      this.match(Sym.More);
    } else if (this.currentChar() === '<') {
      this.match(Sym.Less);
    } else if (this.currentChar() === ',') {
      this.match(Sym.Comma);
    } else if (this.currentChar() === '@') {
      this.match(Sym.At);
    } else if (this.currentChar() === '%') {
      this.match(Sym.Per);
    } else if (this.currentChar() === '-') {
      this.match(Sym.Minus);
    }
  }

  peek() {
    const old = this.state.clone();
    if (this.peekDone) {
      throw new IllegalStateException('SOM lexer: cannot peek twice!');
    }
    this.getSym();
    const nextSym = this.state.sym;
    this.stateAfterPeek = this.state;
    this.state = old;

    this.peekDone = true;
    return nextSym;
  }

  getText() {
    return this.state.text;
  }

  getNextText() {
    return this.stateAfterPeek.text;
  }

  getCurrentLine() {
    return this.state.line;
  }

  getCurrentLineNumber() {
    return this.state.lineNumber;
  }

  getCurrentColumn() {
    return this.state.linePos + 1;
  }

  // All characters read and processed, including current line
  getNumberOfCharactersRead() {
    return this.state.startCoord.charIndex;
  }

  readNextLine() {
    if (this.state.lineNumber >= this.fileLines.length) { return false; }

    let charCntOldLine = this.state.line.length;
    if (this.state.lineNumber > 0) { charCntOldLine += 1; } // add +1 for line break
    this.state.line = this.fileLines[this.state.lineNumber];
    this.state.charsRead = charCntOldLine;
    this.state.lineNumber += 1;
    this.state.linePos = 0;
    return true;
  }

  hasMoreInput() {
    while (this.endOfLine()) {
      if (!this.readNextLine()) {
        return false;
      }
    }
    return true;
  }

  skipWhiteSpace() {
    while (/\s/.test(this.currentChar())) {
      this.state.linePos += 1;
      while (this.endOfLine()) {
        if (!this.readNextLine()) {
          return;
        }
      }
    }
  }

  skipComment() {
    if (this.currentChar() === '"') {
      do {
        this.state.linePos += 1;
        while (this.endOfLine()) {
          if (!this.readNextLine()) { return; }
        }
      } while (this.currentChar() !== '"');
      this.state.linePos += 1;
    }
  }

  currentChar() {
    return this.bufchar(this.state.linePos);
  }

  endOfLine() {
    return this.state.linePos >= this.state.line.length;
  }

  match(s) {
    this.state.set(s, this.currentChar());
    this.state.linePos += 1;
  }

  bufchar(p) {
    return p >= this.state.line.length ? '\0' : this.state.line.charAt(p);
  }

  nextWordInBufferIs(text) {
    if (this.state.line.indexOf(text, this.state.linePos) !== this.state.linePos) {
      return false;
    }
    return !isIdentifierChar(this.bufchar(this.state.linePos + text.length));
  }
}
