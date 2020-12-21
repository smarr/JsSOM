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
import chai from 'chai';
import { universe } from '../../src/som/vm/Universe.js';

const expect = chai.expect;

const integerClass = universe.integerClass;
const classClass = universe.classClass;
const symbolClass = universe.symbolClass;
const doubleClass = universe.doubleClass;

const tests = [
  ['MethodCall', 'test', 42, integerClass],
  ['MethodCall', 'test2', 42, integerClass],

  ['NonLocalReturn', 'test1', 42, integerClass],
  ['NonLocalReturn', 'test2', 43, integerClass],
  ['NonLocalReturn', 'test3', 3, integerClass],
  ['NonLocalReturn', 'test4', 42, integerClass],
  ['NonLocalReturn', 'test5', 22, integerClass],

  ['Blocks', 'testArg1', 42, integerClass],
  ['Blocks', 'testArg2', 77, integerClass],
  ['Blocks', 'testArgAndLocal', 8, integerClass],
  ['Blocks', 'testArgAndContext', 8, integerClass],
  ['Blocks', 'testEmptyZeroArg', 1, integerClass],
  ['Blocks', 'testEmptyOneArg', 1, integerClass],
  ['Blocks', 'testEmptyTwoArg', 1, integerClass],

  ['Return', 'testReturnSelf', 'Return', classClass],
  ['Return', 'testReturnSelfImplicitly', 'Return', classClass],
  ['Return', 'testNoReturnReturnsSelf', 'Return', classClass],
  ['Return', 'testBlockReturnsImplicitlyLastValue', 4, integerClass],

  ['IfTrueIfFalse', 'test', 42, integerClass],
  ['IfTrueIfFalse', 'test2', 33, integerClass],
  ['IfTrueIfFalse', 'test3', 4, integerClass],

  ['CompilerSimplification', 'testReturnConstantSymbol', 'constant', symbolClass],
  ['CompilerSimplification', 'testReturnConstantInt', 42, integerClass],
  ['CompilerSimplification', 'testReturnSelf', 'CompilerSimplification', classClass],
  ['CompilerSimplification', 'testReturnSelfImplicitly', 'CompilerSimplification', classClass],
  ['CompilerSimplification', 'testReturnArgumentN', 55, integerClass],
  ['CompilerSimplification', 'testReturnArgumentA', 44, integerClass],
  ['CompilerSimplification', 'testSetField', 'foo', symbolClass],
  ['CompilerSimplification', 'testGetField', 40, integerClass],

  ['Hash', 'testHash', 444, integerClass],

  ['Arrays', 'testEmptyToInts', 3, integerClass],
  ['Arrays', 'testPutAllInt', 5, integerClass],
  ['Arrays', 'testPutAllNil', 'Nil', classClass],
  ['Arrays', 'testPutAllBlock', 3, integerClass],
  ['Arrays', 'testNewWithAll', 1, integerClass],

  ['BlockInlining', 'testNoInlining', 1, integerClass],
  ['BlockInlining', 'testOneLevelInlining', 1, integerClass],
  ['BlockInlining', 'testOneLevelInliningWithLocalShadowTrue', 2, integerClass],
  ['BlockInlining', 'testOneLevelInliningWithLocalShadowFalse', 1, integerClass],

  ['BlockInlining', 'testBlockNestedInIfTrue', 2, integerClass],
  ['BlockInlining', 'testBlockNestedInIfFalse', 42, integerClass],

  ['BlockInlining', 'testDeepNestedInlinedIfTrue', 3, integerClass],
  ['BlockInlining', 'testDeepNestedInlinedIfFalse', 42, integerClass],

  ['BlockInlining', 'testDeepNestedBlocksInInlinedIfTrue', 5, integerClass],
  ['BlockInlining', 'testDeepNestedBlocksInInlinedIfFalse', 43, integerClass],

  ['BlockInlining', 'testDeepDeepNestedTrue', 9, integerClass],
  ['BlockInlining', 'testDeepDeepNestedFalse', 43, integerClass],

  ['BlockInlining', 'testToDoNestDoNestIfTrue', 2, integerClass],

  ['NonLocalVars', 'testWriteDifferentTypes', 3.75, doubleClass],

  ['ObjectCreation', 'test', 1000000, integerClass],

  ['Regressions', 'testSymbolEquality', 1, integerClass],
  ['Regressions', 'testSymbolReferenceEquality', 1, integerClass],
  ['Regressions', 'testUninitializedLocal', 1, integerClass],
  ['Regressions', 'testUninitializedLocalInBlock', 1, integerClass],

  ['BinaryOperation', 'test', 3 + 8, integerClass],

  ['NumberOfTests', 'numberOfTests', 57, integerClass],
];

function assertEqualsSomValue(expectedValue, expectedType, actualValue) {
  if (expectedType === integerClass) {
    expect(actualValue.getEmbeddedInteger()).to.equal(expectedValue);
    return;
  }
  if (expectedType === doubleClass) {
    expect(actualValue.getEmbeddedDouble()).to.equal(expectedValue);
    return;
  }
  if (expectedType === symbolClass) {
    expect(actualValue.getString()).to.equal(expectedValue);
    return;
  }
  if (expectedType === classClass) {
    expect(actualValue.getName().getString()).to.equal(expectedValue);
    return;
  }
  throw new Error('SOM Value handler missing');
}

describe('BasicInterpreterTests', () => {
  for (const test of tests) {
    const testClass = test[0];
    const testMethod = test[1];
    const expectedResult = test[2];
    const expectedResultType = test[3];

    it(`should pass ${testClass}>>#${testMethod}`, () => {
      // eslint-disable-next-line no-unused-expressions
      expect(universe).not.to.be.null;

      universe.setAvoidExit(true);
      universe.setupClassPath('core-lib/Smalltalk:core-lib/TestSuite/BasicInterpreterTests');

      const actualResult = universe.interpretMethodInClass(testClass, testMethod);
      assertEqualsSomValue(expectedResult, expectedResultType, actualResult);
    });
  }
});
