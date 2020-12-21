// @ts-check

import { compileClassString } from './som/compiler/SourcecodeCompiler.js';
import { universe } from './som/vm/Universe.js';

export function moveCaretToEnd(el) {
  if (typeof el.selectionStart === 'number') {
    el.selectionEnd = el.value.length;
    el.selectionStart = el.selectionEnd;
  } else if (typeof el.createTextRange !== 'undefined') {
    el.focus();
    const range = el.createTextRange();
    range.collapse(false);
    range.select();
  }
}

let replInvokeCnt = 0;
let it = universe.nilObject;

export function handleReplInput(e) {
  if (e.target.value.indexOf('\n') !== -1) {
    const input = e.target.value;
    document.getElementById('repl-out').innerHTML += `---> ${input}`;

    e.target.value = '';
    replInvokeCnt += 1;

    const stmt = `Shell_Class_${replInvokeCnt} = ( run: it = ( | tmp | tmp := (${
      input} ). 'it = ' print. ^tmp println ) )`;
    const myClass = compileClassString(stmt, null, universe);
    const myObject = universe.newInstance(myClass);
    const shellMethod = myClass.lookupInvokable(universe.symbolFor('run:'));
    try {
      it = shellMethod.invoke(null, [myObject, it]);
    } catch (ex) {
      document.getElementById('repl-out').innerHTML += `Error: ${ex.toString()}`;
    }
  }
}

universe.initializeForStandardRepl();
