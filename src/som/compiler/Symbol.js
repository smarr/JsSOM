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

const symStrings = [
  'NONE',
  'Integer',
  'Double',
  'Not',
  'And',
  'Or',
  'Star',
  'Div',
  'Mod',
  'Plus',
  'Minus',
  'Equal',
  'More',
  'Less',
  'Comma',
  'At',
  'Per',
  'NewBlock',
  'EndBlock',
  'Colon',
  'Period',
  'Exit',
  'Assign',
  'NewTerm',
  'EndTerm',
  'Pound',
  'Primitive',
  'Separator',
  'STString',
  'Identifier',
  'Keyword',
  'KeywordSequence',
  'OperatorSequence'];

export const Sym = {
  NONE: 0,
  Integer: 1,
  Double: 2,
  Not: 3,
  And: 4,
  Or: 5,
  Star: 6,
  Div: 7,
  Mod: 8,
  Plus: 9,
  Minus: 10,
  Equal: 11,
  More: 12,
  Less: 13,
  Comma: 14,
  At: 15,
  Per: 16,
  NewBlock: 17,
  EndBlock: 18,
  Colon: 19,
  Period: 20,
  Exit: 21,
  Assign: 22,
  NewTerm: 23,
  EndTerm: 24,
  Pound: 25,
  Primitive: 26,
  Separator: 27,
  STString: 28,
  Identifier: 29,
  Keyword: 30,
  KeywordSequence: 31,
  OperatorSequence: 32,

  toString(sym) {
    return symStrings[sym];
  },
};
