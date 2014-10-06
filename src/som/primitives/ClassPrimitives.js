'use strict';

function ClassPrimitives() {
    Primitives.call(this);
    var _this = this;

    function _new(args) {
        return universe.newInstance(args[0]);
    }

    function _name(args) {
        return args[0].getName();
    }

    function _superClass(args) {
        return args[0].getSuperClass();
    }

    function _methods(args) {
        return args[0].getInstanceInvokables();
    }

    function _fields(args) {
        return args[0].getInstanceFields();
    }

    this.installPrimitives = function () {
        _this.installInstancePrimitive("new",         _new);
        _this.installInstancePrimitive("name",        _name);
        _this.installInstancePrimitive("superclass",  _superClass);
        _this.installInstancePrimitive("methods",     _methods);
        _this.installInstancePrimitive("fields",      _fields);
    }
}
ClassPrimitives.prototype = Object.create(Primitives.prototype);
som.primitives["Class"] = ClassPrimitives;
