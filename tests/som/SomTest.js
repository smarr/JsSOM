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
import { expect } from 'chai';
import { universe } from '../../src/som/vm/Universe.js';

const tests = [
  'ClassStructure',
  'Array',
  'Block',
  'ClassLoading',
  'Closure',
  'Coercion',
  'CompilerReturn',
  'Double',
  'DoesNotUnderstand',
  'Global',
  'Empty',
  'Hash',
  'Integer',
  'Preliminary',
  'Reflection',
  'SelfBlock',
  'Super',
  'String',
  'Symbol',
  'System',
  'Vector'];

describe('SomTests', () => {
  for (const test of tests) {
    it(`should pass ${test}`, () => {
      const args = ['-cp', 'core-lib/Smalltalk', 'core-lib/TestSuite/TestHarness.som', test];
      universe.setAvoidExit(true);
      universe.interpret(args);

      expect(universe.getLastExitCode()).to.equal(0);
    });
  }
});
