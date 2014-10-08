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
        var superClass  = universe.loadClass(superName);
        var resultClass = universe.newClass(som.metaclassClass);

        // Initialize the class of the resulting class
        resultClass.setInstanceFields(
            universe.newArrayFrom(classFields.slice()));
        resultClass.setInstanceInvokables(
            universe.newArrayFrom(classMethods.slice()));
        resultClass.setName(universe.symbolFor(ccName));

        var superMClass = superClass.getClass();
        resultClass.setSuperClass(superMClass);

        // Allocate the resulting class
        var result = universe.newClass(resultClass);

        // Initialize the resulting class
        result.setName(name);
        result.setSuperClass(superClass);
        result.setInstanceFields(
            universe.newArrayFrom(instanceFields.slice()));
        result.setInstanceInvokables(
            universe.newArrayFrom(instanceMethods.slice()));

        return result;
    };

    this.assembleSystemClass = function (systemClass) {
        systemClass.setInstanceInvokables(
            universe.newArrayFrom(instanceMethods.slice()));
        systemClass.setInstanceFields(
            universe.newArrayFrom(instanceFields.slice()));

        // class-bound == class-instance-bound
        var superMClass = systemClass.getClass();
        superMClass.setInstanceInvokables(
            universe.newArrayFrom(classMethods.slice()));
        superMClass.setInstanceFields(
            universe.newArrayFrom(classFields.slice()));
    };

    this.toString = function () {
        return "ClassGenC(" + name.getString() + ")";
    };

    Object.freeze(this);
}
