// @ts-check

export class SourceSection {
  constructor(qualifier, startLine, startColumn, charIndex, length) {
    this.qualifier = qualifier;
    this._startLine = startLine;
    this._startColumn = startColumn;
    this._charIndex = charIndex;
    this._length = length;
  }

  startLine() { return this._startLine; }

  startColumn() { return this._startColumn; }

  charIndex() { return this._charIndex; }

  length() { return this._length; }
}
