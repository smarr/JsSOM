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

let _getMillisecondTicks;
let _stdout;
let _stdoutnl;
let _stderr;
let _stderrnl;
let _isBrowser;
let _exitInterpreter;

let outHandler = null;

export function setOutHandler(handler) {
  outHandler = handler;
}

if (typeof global === 'undefined' || process.browser) {
  // this seems to be a browser environment
  if (typeof performance === 'undefined' || performance.now === undefined) {
    _getMillisecondTicks = () => Date.now();
  } else {
    _getMillisecondTicks = () => performance.now();
  }

  _stdout = (msg) => {
    if (outHandler) {
      outHandler(msg);
    } else {
      document.write(msg);
    }
  };

  _stdoutnl = (msg) => {
    _stdout(`${msg}<br/>`);
  };

  _stderr = (msg) => {
    _stdout(`<span style='color:red';>${msg}</span>`);
  };

  _stderrnl = (msg) => {
    _stdout(`<span style='color:red';>${msg}<br/></span>`);
  };

  _exitInterpreter = (_errorCode) => { };

  _isBrowser = true;
} else {
  // this seems to be node.js
  _getMillisecondTicks = () => {
    const timeTuple = process.hrtime();
    return timeTuple[0] * 1000 + timeTuple[1] / 1000000;
  };

  _stdout = (msg) => { process.stdout.write(msg); };
  _stderr = (msg) => { process.stderr.write(msg); };

  _stdoutnl = (msg) => {
    process.stdout.write(`${msg}\n`);
  };

  _stderrnl = (msg) => {
    process.stderr.write(`${msg}\n`);
  };

  _exitInterpreter = process.exit;
  _isBrowser = false;
}

export const getMillisecondTicks = _getMillisecondTicks;
export const stdout = _stdout;
export const stdoutnl = _stdoutnl;
export const stderr = _stderr;
export const stderrnl = _stderrnl;
export const exitInterpreter = _exitInterpreter;
export const isBrowser = _isBrowser;

export function isInIntRange(val) {
  return val >= -2147483647 && val <= 2147483647;
}

export function intOrBigInt(val, universe) {
  if (isInIntRange(val)) {
    if (typeof val === 'bigint') {
      return universe.newInteger(Number(val) | 0);
    }
    return universe.newInteger(val | 0);
  }
  if (typeof val !== 'bigint') {
    val = BigInt(val);
  }
  return universe.newBigInteger(val);
}
