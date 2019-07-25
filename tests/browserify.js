const u = require('../src/som/vm/Universe');
const compileClassString = require('../src/som/compiler/SourcecodeCompiler').compileClassString;
const universe = u.universe;

if (document) {
  document.u = u;
  document.compileClassString = compileClassString;
}

universe.interpret(["-cp", "core-lib/Smalltalk", "core-lib/TestSuite/TestHarness.som "]);


