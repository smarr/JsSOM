BasicInterpreterTests = TestCase("BasicInterpreterTests");

var test = [
    ["MethodCall",     "test",  42, som.integerClass],
    ["MethodCall",     "test2", 42, som.integerClass],

    ["NonLocalReturn", "test",  "NonLocalReturn", som.classClass],
    ["NonLocalReturn", "test1", 42, som.integerClass],
    ["NonLocalReturn", "test2", 43, som.integerClass],
    ["NonLocalReturn", "test3",  3, som.integerClass],
    ["NonLocalReturn", "test4", 42, som.integerClass],
    ["NonLocalReturn", "test5", 22, som.integerClass],

    ["Blocks", "arg1",          42, som.integerClass],
    ["Blocks", "arg2",          77, som.integerClass],
    ["Blocks", "argAndLocal",    8, som.integerClass],
    ["Blocks", "argAndContext",  8, som.integerClass],

    ["Return", "returnSelf",           "Return", som.classClass],
    ["Return", "returnSelfImplicitly", "Return", som.classClass],
    ["Return", "noReturnReturnsSelf",  "Return", som.classClass],
    ["Return", "blockReturnsImplicitlyLastValue", 4, som.integerClass],

    ["IfTrueIfFalse", "test",  42, som.integerClass],
    ["IfTrueIfFalse", "test2", 33, som.integerClass],
    ["IfTrueIfFalse", "test3",  4, som.integerClass],

    ["CompilerSimplification", "returnConstantSymbol",  "constant", som.symbolClass],
    ["CompilerSimplification", "returnConstantInt",        42,      som.integerClass],
    ["CompilerSimplification", "returnSelf",            "CompilerSimplification", som.classClass],
    ["CompilerSimplification", "returnSelfImplicitly",  "CompilerSimplification", som.classClass],
    ["CompilerSimplification", "testReturnArgumentN",      55,      som.integerClass],
    ["CompilerSimplification", "testReturnArgumentA",      44,      som.integerClass],
    ["CompilerSimplification", "testSetField",          "foo",      som.symbolClass],
    ["CompilerSimplification", "testGetField",             40,      som.integerClass]];

function assertEqualsSomValue(expectedValue, expectedType, actualValue) {
    if (expectedType == som.integerClass) {
        assertEquals(expectedValue, actualValue.getEmbeddedInteger());
        return;
    }
    if (expectedType == som.symbolClass) {
        assertEquals(expectedValue, actualValue.getString());
        return;
    }
    if (expectedType == som.classClass) {
        assertEquals(expectedValue, actualValue.getName().getString());
        return;
    }
    fail("SOM Value handler missing");
}

function createTestFunctions(element, index, array) {
    var testClass          = element[0];
    var testMethod         = element[1];
    var expectedResult     = element[2];
    var expectedResultType = element[3];
    BasicInterpreterTests.prototype[
        'test_' + testClass + '_' + testMethod] = function () {
        assertNotNull("Universe not initialized", universe);

        universe.setAvoidExit(true);
        universe.setupClassPath("Smalltalk:TestSuite/BasicInterpreterTests");

        var actualResult = universe.interpretMethodInClass(testClass, testMethod);
        assertEqualsSomValue(expectedResult, expectedResultType, actualResult);
    }
}
test.forEach(createTestFunctions);
