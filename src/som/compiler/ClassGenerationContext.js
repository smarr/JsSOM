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
const u = require('../vm/Universe');

class ClassGenerationContext {
    constructor() {
        this.name = null;
        this.superName = null;
        this.classSide = false;
        this.instanceFields = new Array();
        this.instanceMethods = new Array();
        this.classFields = new Array();
        this.classMethods = new Array();
    }

    setName(symbol) {
        this.name = symbol;
    }

    getName() {
        return this.name;
    }

    setSuperName(symbol) {
        this.superName = symbol;
    }

    setInstanceFieldsOfSuper(fieldNames) {
        this.instanceFields = this.instanceFields.concat(fieldNames.getIndexableFields());
    }

    setClassFieldsOfSuper(fieldNames) {
        this.classFields = this.classFields.concat(fieldNames.getIndexableFields());
    }

    addInstanceMethod(method) {
        this.instanceMethods.push(method);
    }

    setClassSide(bool) {
        this.classSide = bool;
    }

    addClassMethod(method) {
        this.classMethods.push(method);
    }

    addInstanceField(symbol) {
        this.instanceFields.push(symbol);
    }

    addClassField(symbol) {
        this.classFields.push(symbol);
    }

    hasField(symbol) {
        return (this.classSide ? this.classFields : this.instanceFields).
            indexOf(symbol) != -1;
    }

    getFieldIndex(symbol) {
        return (this.classSide ? this.classFields : this.instanceFields).
            indexOf(symbol);
    }

    isClassSide() {
        return this.classSide;
    }

    assemble() {
        const ccName = this.name.getString() + " class";

        // Load the super class
        const superClass = u.universe.loadClass(this.superName);
        const resultClass = u.universe.newClass(u.metaclassClass);

        // Initialize the class of the resulting class
        resultClass.setInstanceFields(
            u.universe.newArrayFrom(this.classFields.slice()));
        resultClass.setInstanceInvokables(
            u.universe.newArrayFrom(this.classMethods.slice()));
        resultClass.setName(u.universe.symbolFor(ccName));

        const superMClass = superClass.getClass();
        resultClass.setSuperClass(superMClass);

        // Allocate the resulting class
        const result = u.universe.newClass(resultClass);

        // Initialize the resulting class
        result.setName(this.name);
        result.setSuperClass(superClass);
        result.setInstanceFields(
            u.universe.newArrayFrom(this.instanceFields.slice()));
        result.setInstanceInvokables(
            u.universe.newArrayFrom(this.instanceMethods.slice()));

        return result;
    }

    assembleSystemClass(systemClass) {
        systemClass.setInstanceInvokables(
            u.universe.newArrayFrom(this.instanceMethods.slice()));
        systemClass.setInstanceFields(
            u.universe.newArrayFrom(this.instanceFields.slice()));

        // class-bound == class-instance-bound
        var superMClass = systemClass.getClass();
        superMClass.setInstanceInvokables(
            u.universe.newArrayFrom(this.classMethods.slice()));
        superMClass.setInstanceFields(
            u.universe.newArrayFrom(this.classFields.slice()));
    }

    toString() {
        return "ClassGenC(" + this.name.getString() + ")";
    }
}

exports.ClassGenerationContext = ClassGenerationContext;
