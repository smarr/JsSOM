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

export class ClassGenerationContext {
  constructor() {
    this.name = null;
    this.superName = null;
    this.classSide = false;
    this.instanceFields = [];
    this.instanceMethods = [];
    this.classFields = [];
    this.classMethods = [];
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
    return (this.classSide ? this.classFields : this.instanceFields)
      .indexOf(symbol) !== -1;
  }

  getFieldIndex(symbol) {
    return (this.classSide ? this.classFields : this.instanceFields)
      .indexOf(symbol);
  }

  isClassSide() {
    return this.classSide;
  }

  assemble(universe) {
    const ccName = `${this.name.getString()} class`;

    // Load the super class
    const superClass = universe.loadClass(this.superName);
    const resultClass = universe.newClass(universe.metaclassClass);

    // Initialize the class of the resulting class
    resultClass.setInstanceFields(
      universe.newArrayFrom(this.classFields.slice()),
    );
    resultClass.setInstanceInvokables(
      universe.newArrayFrom(this.classMethods.slice()),
    );
    resultClass.setName(universe.symbolFor(ccName));

    const superMClass = superClass.getClass();
    resultClass.setSuperClass(superMClass);

    // Allocate the resulting class
    const result = universe.newClass(resultClass);

    // Initialize the resulting class
    result.setName(this.name);
    result.setSuperClass(superClass);
    result.setInstanceFields(
      universe.newArrayFrom(this.instanceFields.slice()),
    );
    result.setInstanceInvokables(
      universe.newArrayFrom(this.instanceMethods.slice()),
    );

    return result;
  }

  assembleSystemClass(systemClass, universe) {
    systemClass.setInstanceInvokables(
      universe.newArrayFrom(this.instanceMethods.slice()),
    );
    systemClass.setInstanceFields(
      universe.newArrayFrom(this.instanceFields.slice()),
    );

    // class-bound == class-instance-bound
    const superMClass = systemClass.getClass();
    superMClass.setInstanceInvokables(
      universe.newArrayFrom(this.classMethods.slice()),
    );
    superMClass.setInstanceFields(
      universe.newArrayFrom(this.classFields.slice()),
    );
  }

  toString() {
    return `ClassGenC(${this.name.getString()})`;
  }
}
