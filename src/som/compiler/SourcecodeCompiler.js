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
//@ts-check
"use strict";
const fs = require('fs');
const IllegalStateException = require('../../lib/exceptions').IllegalStateException;
const isBrowser = require('../../lib/platform').isBrowser;

const ClassGenerationContext = require('./ClassGenerationContext').ClassGenerationContext;

const Parser = require('./Parser').Parser;

let somCoreLib = null;

if (isBrowser) {
    const loadCoreLib = require('../../../build/som').loadCoreLib;
    somCoreLib = loadCoreLib();
}

function getFileFromJson(path, file) {
    var current = somCoreLib;

    path.split("/").forEach(function (e) {
        if (current == undefined) {
            return null;
        }
        current = current[e];
    });

    if (current == undefined || current[file] == undefined) {
        return null;
    } else {
        return current[file];
    }
}

function getFile(path, file) {
    if (isBrowser) {
        return getFileFromJson(path, file);
    }

    const name = path + '/' + file;
    if (!fs.existsSync(name)) {
        return null;
    }
    return fs.readFileSync(name, {encoding: 'utf-8'});
}

function compile(parser, systemClass) {
    var cgc = new ClassGenerationContext();

    var result = systemClass;
    // try {
        parser.classdef(cgc);
    //} catch (pe) {
    //    universe.errorExit(pe.toString());
    //}

    if (systemClass == null) {
        result = cgc.assemble();
    } else {
        cgc.assembleSystemClass(result);
    }

    return result;
}

function compileClassFile(path, file, systemClass) {
    var source = getFile(path, file + ".som");
    if (source == null) {
        return null;
    }

    var result = compile(new Parser(source, path + '/' + file + '.som'), systemClass);

    var cname  = result.getName();
    var cnameC = cname.getString();

    if (file != cnameC) {
        throw new IllegalStateException("File name " + file
            + " does not match class name " + cnameC);
    }
    return result;
}

function compileClassString(stmt, systemClass) {
    return compile(new Parser(stmt, '$string'), systemClass);
}

exports.compileClassFile = compileClassFile;
exports.compileClassString = compileClassString;
