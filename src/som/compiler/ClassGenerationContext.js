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
const u = require('../vm/Universe');

function ClassGenerationContext() {
    var name;
    var superName;
    var classSide       = false;
    var instanceFields  = new Array();
    var instanceMethods = new Array();
    var classFields     = new Array();
    var classMethods    = new Array();

    this.setName = function (symbol) {
        name = symbol;
    };

    this.getName = function () {
        return name;
    };

    this.setSuperName = function (symbol) {
        superName = symbol;
    };

    this.setInstanceFieldsOfSuper = function (fieldNames) {
        instanceFields = instanceFields.concat(fieldNames.getIndexableFields());
    };

    this.setClassFieldsOfSuper = function (fieldNames) {
        classFields = classFields.concat(fieldNames.getIndexableFields());
    };

    this.addInstanceMethod = function (method) {
        instanceMethods.push(method);
    };

    this.setClassSide = function (bool) {
        classSide = bool;
    };

    this.addClassMethod = function (method) {
        classMethods.push(method);
    };

    this.addInstanceField = function (symbol) {
        instanceFields.push(symbol);
    };

    this.addClassField = function (symbol) {
        classFields.push(symbol);
    };

    this.hasField = function (symbol) {
        return (classSide ? classFields : instanceFields).
            indexOf(symbol) != -1;
    };

    this.getFieldIndex = function (symbol) {
        return (classSide ? classFields : instanceFields).
            indexOf(symbol);
    };

    this.isClassSide = function () {
        return classSide;
    };

    this.assemble = function () {
        var ccName = name.getString() + " class";

        // Load the super class
        var superClass  = u.universe.loadClass(superName);
        var resultClass = u.universe.newClass(u.metaclassClass);

        // Initialize the class of the resulting class
        resultClass.setInstanceFields(
            u.universe.newArrayFrom(classFields.slice()));
        resultClass.setInstanceInvokables(
            u.universe.newArrayFrom(classMethods.slice()));
        resultClass.setName(u.universe.symbolFor(ccName));

        var superMClass = superClass.getClass();
        resultClass.setSuperClass(superMClass);

        // Allocate the resulting class
        var result = u.universe.newClass(resultClass);

        // Initialize the resulting class
        result.setName(name);
        result.setSuperClass(superClass);
        result.setInstanceFields(
            u.universe.newArrayFrom(instanceFields.slice()));
        result.setInstanceInvokables(
            u.universe.newArrayFrom(instanceMethods.slice()));

        return result;
    };

    this.assembleSystemClass = function (systemClass) {
        systemClass.setInstanceInvokables(
            u.universe.newArrayFrom(instanceMethods.slice()));
        systemClass.setInstanceFields(
            u.universe.newArrayFrom(instanceFields.slice()));

        // class-bound == class-instance-bound
        var superMClass = systemClass.getClass();
        superMClass.setInstanceInvokables(
            u.universe.newArrayFrom(classMethods.slice()));
        superMClass.setInstanceFields(
            u.universe.newArrayFrom(classFields.slice()));
    };

    this.toString = function () {
        return "ClassGenC(" + name.getString() + ")";
    };

    Object.freeze(this);
}

exports.ClassGenerationContext = ClassGenerationContext;
