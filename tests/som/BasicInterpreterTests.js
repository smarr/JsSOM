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
const u = require("../../src/som/vm/Universe");
const universe = u.universe;

const expect = require('chai').expect;


var tests = [
    ["MethodCall",     "test",  42, u.integerClass],
    ["MethodCall",     "test2", 42, u.integerClass],

    ["NonLocalReturn", "test",  "NonLocalReturn", u.classClass],
    ["NonLocalReturn", "test1", 42, u.integerClass],
    ["NonLocalReturn", "test2", 43, u.integerClass],
    ["NonLocalReturn", "test3",  3, u.integerClass],
    ["NonLocalReturn", "test4", 42, u.integerClass],
    ["NonLocalReturn", "test5", 22, u.integerClass],

    ["Blocks", "arg1",          42, u.integerClass],
    ["Blocks", "arg2",          77, u.integerClass],
    ["Blocks", "argAndLocal",    8, u.integerClass],
    ["Blocks", "argAndContext",  8, u.integerClass],
    ["Blocks", "testEmptyZeroArg", 1, u.integerClass],
    ["Blocks", "testEmptyOneArg",  1, u.integerClass],
    ["Blocks", "testEmptyTwoArg",  1, u.integerClass],


    ["Return", "returnSelf",           "Return", u.classClass],
    ["Return", "returnSelfImplicitly", "Return", u.classClass],
    ["Return", "noReturnReturnsSelf",  "Return", u.classClass],
    ["Return", "blockReturnsImplicitlyLastValue", 4, u.integerClass],

    ["IfTrueIfFalse", "test",  42, u.integerClass],
    ["IfTrueIfFalse", "test2", 33, u.integerClass],
    ["IfTrueIfFalse", "test3",  4, u.integerClass],

    ["CompilerSimplification", "testReturnConstantSymbol",  "constant", u.symbolClass],
    ["CompilerSimplification", "testReturnConstantInt",        42,      u.integerClass],
    ["CompilerSimplification", "testReturnSelf",            "CompilerSimplification", u.classClass],
    ["CompilerSimplification", "testReturnSelfImplicitly",  "CompilerSimplification", u.classClass],
    ["CompilerSimplification", "testReturnArgumentN",      55,      u.integerClass],
    ["CompilerSimplification", "testReturnArgumentA",      44,      u.integerClass],
    ["CompilerSimplification", "testSetField",          "foo",      u.symbolClass],
    ["CompilerSimplification", "testGetField",             40,      u.integerClass],

    ["Hash", "testHash", 444, u.integerClass],

    ["Arrays", "testEmptyToInts", 3, u.integerClass],
    ["Arrays", "testPutAllInt", 5, u.integerClass],
    ["Arrays", "testPutAllNil", "Nil", u.classClass],
    ["Arrays", "testPutAllBlock", 3, u.integerClass],
    ["Arrays", "testNewWithAll", 1, u.integerClass],

    ["BlockInlining", "testNoInlining", 1, u.integerClass],
    ["BlockInlining", "testOneLevelInlining", 1, u.integerClass],
    ["BlockInlining", "testOneLevelInliningWithLocalShadowTrue", 2, u.integerClass],
    ["BlockInlining", "testOneLevelInliningWithLocalShadowFalse", 1, u.integerClass],

    ["BlockInlining", "testBlockNestedInIfTrue", 2, u.integerClass],
    ["BlockInlining", "testBlockNestedInIfFalse", 42, u.integerClass],

    ["BlockInlining", "testDeepNestedInlinedIfTrue", 3, u.integerClass],
    ["BlockInlining", "testDeepNestedInlinedIfFalse", 42, u.integerClass],

    ["BlockInlining", "testDeepNestedBlocksInInlinedIfTrue", 5, u.integerClass],
    ["BlockInlining", "testDeepNestedBlocksInInlinedIfFalse", 43, u.integerClass],

    ["BlockInlining", "testDeepDeepNestedTrue", 9, u.integerClass],
    ["BlockInlining", "testDeepDeepNestedFalse", 43, u.integerClass],

    ["BlockInlining", "testToDoNestDoNestIfTrue", 2, u.integerClass],

    ["NonLocalVars", "testWriteDifferentTypes", 3.75, u.doubleClass],

    ["ObjectCreation", "test", 1000000, u.integerClass],

    ["Regressions", "testSymbolEquality", 1, u.integerClass],
    ["Regressions", "testSymbolReferenceEquality", 1, u.integerClass],
    ["Regressions", "testUninitializedLocal", 1, u.integerClass],
    ["Regressions", "testUninitializedLocalInBlock", 1, u.integerClass],

    ["BinaryOperation", "test", 3 + 8, u.integerClass],

    ["NumberOfTests", "numberOfTests", 57, u.integerClass]
];

function assertEqualsSomValue(expectedValue, expectedType, actualValue) {
    if (expectedType == u.integerClass) {
        expect(actualValue.getEmbeddedInteger()).to.equal(expectedValue);
        return;
    }
    if (expectedType == u.symbolClass) {
        expect(actualValue.getString()).to.equal(expectedValue);
        return;
    }
    if (expectedType == u.classClass) {
        expect(actualValue.getName().getString()).to.equal(expectedValue);
        return;
    }
    fail("SOM Value handler missing");
}

describe("BasicInterpreterTests", function() {
    for (const test of tests) {
        const testClass          = test[0];
        const testMethod         = test[1];
        const expectedResult     = test[2];
        const expectedResultType = test[3];

        it ("should pass " + testClass + ">>#" + testMethod, function () {
            expect(universe).not.to.be.null;

            universe.setAvoidExit(true);
            universe.setupClassPath("core-lib/Smalltalk:core-lib/TestSuite/BasicInterpreterTests");

            const actualResult = universe.interpretMethodInClass(testClass, testMethod);
            assertEqualsSomValue(expectedResult, expectedResultType, actualResult);
        });
    }
});
