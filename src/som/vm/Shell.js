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

import { universe } from './Universe.js';

import { compileClassString } from '../compiler/SourcecodeCompiler.js';

export class Shell {
  start() {
    let counter = 0;
    let it = universe.nilObject;
    universe.println('SOM Shell. Type "quit" to exit.\n');
    universe.setAvoidExit(true);
    universe.print('---> ');

    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      try {
        // Read a statement from the keyboard
        const stmt = process.stdin.read();
        if (stmt == null) { return; }

        if (stmt === 'quit' || stmt === 'quit\n') {
          process.exit(0);
        }

        counter += 1;

        // Generate a temporary class with a run method
        const stmtClass = `Shell_Class_${counter} = ( run: it = ( | tmp | tmp := (${
          stmt} ). 'it = ' print. ^tmp println ) )`;

        // Compile and load the newly generated class
        const myClass = compileClassString(stmtClass, null, universe);
        if (myClass != null) {
          const myObject = universe.newInstance(myClass);
          // Lookup the run: method
          const shellMethod = myClass
            .lookupInvokable(universe.symbolFor('run:'));

          // Invoke the run method
          it = shellMethod.invoke(null, [myObject, it]);
          universe.print('---> ');
        }
      } catch (e) {
        universe.errorPrintln(`Caught exception: ${e.toString()}`);
      }
    });
  }
}
