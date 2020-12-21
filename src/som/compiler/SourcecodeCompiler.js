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

import { getFile } from '../../lib/core-lib.js';
import { IllegalStateException } from '../../lib/exceptions.js';

import { ClassGenerationContext } from './ClassGenerationContext.js';

import { Parser } from './Parser.js';

function compile(parser, systemClass, universe) {
  const cgc = new ClassGenerationContext();

  let result = systemClass;
  try {
    parser.classdef(cgc);
  } catch (pe) {
    universe.errorExit(pe.toString());
  }

  if (systemClass == null) {
    result = cgc.assemble(universe);
  } else {
    cgc.assembleSystemClass(result, universe);
  }

  return result;
}

export function compileClassFile(path, file, systemClass, universe) {
  const source = getFile(path, `${file}.som`);
  if (source == null) {
    return null;
  }

  const result = compile(
    new Parser(source, `${path}/${file}.som`), systemClass, universe,
  );

  const cname = result.getName();
  const cnameC = cname.getString();

  if (file !== cnameC) {
    throw new IllegalStateException(`File name ${file
    } does not match class name ${cnameC}`);
  }
  return result;
}

export function compileClassString(stmt, systemClass, universe) {
  return compile(new Parser(stmt, '$string'), systemClass, universe);
}
