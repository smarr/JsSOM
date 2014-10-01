'use strict';

function ClassGenerationContext(univ) {
    var universe = univ;
    var name;
    var superName;
    var classSide       = false;
    var instanceFields  = new Array();
    var instanceMethods = new Array();
    var classFields     = new Array();
    var classMethods    = new Array();
    Object.freeze(this);

    function setName(symbol) {
        name = symbol;
    }

    function getName() {
        return name;
    }

    function setSuperName(symbol) {
        superName = symbol;
    }

    function setInstanceFieldsOfSuper(fieldNames) {
        instanceFields = instanceFields.concat(fieldNames);
    }

    function setClassFieldsOfSuper(fieldNames) {
        classFields = classFields.concat(fieldNames);
    }

    function addInstanceMethod(method) {
        instanceMethods.push(method);
    }

    function setClassSide(bool) {
        classSide = bool;
    }

    function addClassMethod(method) {
        classMethods.push(method);
    }

    function addInstanceField(symbol) {
        instanceFields.push(symbol);
    }

    function addClassField(symbol) {
        classFields.push(symbol);
    }

    function hasField(symbol) {
        return (classSide ? classFields : instanceFields).
            indexOf(symbol) != -1;
    }

    function getFieldIndex(symbol) {
        return (classSide ? classFields : instanceFields).
            indexOf(symbol);
    }

    function isClassSide() {
        return classSide;
    }

    function assemble() {
        var ccName = name.getString() + " class";

        // Load the super class
        var superClass  = universe.loadClass(superName);
        var resultClass = universe.newClass(Classes.metaclassClass);

        // Initialize the class of the resulting class
        resultClass.setInstanceFields(classFields.slice());
        resultClass.setInstanceInvokables(classMethods.slice());
        resultClass.setName(universe.symbolFor(ccName));

        var superMClass = superClass.getClass();
        resultClass.setSuperClass(superMClass);

        // Allocate the resulting class
        var result = universe.newClass(resultClass);

        // Initialize the resulting class
        result.setName(name);
        result.setSuperClass(superClass);
        result.setInstanceFields(instanceFields.slice());
        result.setInstanceInvokables(instanceMethods.slice());

        return result;
    }

    function assembleSystemClass(systemClass) {
        systemClass.setInstanceInvokables(instanceMethods.slice());
        systemClass.setInstanceFields(instanceFields.slice());

        // class-bound == class-instance-bound
        var superMClass = systemClass.getClass();
        superMClass.setInstanceInvokables(classMethods.slice());
        superMClass.setInstanceFields(classFields.slice());
    }

    function toString() {
        return "ClassGenC(" + name.getString() + ")";
    }
}
