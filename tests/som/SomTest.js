SomTests = TestCase("SomTests");

var tests = [
    "ClassStructure",
    "Array"         ,
    "Block"         ,
    "ClassLoading"  ,
    "Closure"       ,
    "Coercion"      ,
    "CompilerReturn",
    "Double"        ,
    "DoesNotUnderstand",
    "Empty"         ,
    "Hash"          ,
    "Integer"       ,
    "ObjectSize"    ,
    "Preliminary"   ,
    "Reflection"    ,
    "SelfBlock"     ,
    "Super"         ,
    "String"        ,
    "Symbol"        ,
    "System"        ,
    "Vector"         ];

function createTests(name) {
    SomTests.prototype['test_' + name] = function () {
        var args = ["-cp", "Smalltalk", "TestSuite/TestHarness.som", name];
        universe.setAvoidExit(true);
        universe.interpret(args);

        assertEquals(0, universe.getLastExitCode());
    }
}
tests.forEach(createTests);
