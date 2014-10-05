'use strict';

function ObjectPrimitives() {
    Primitives.call(this);
    var _this = this;

    this.installPrimitives = function () {
        _this.installInstancePrimitive("==",                     EqualsEqualsPrimFactory.getInstance());
        _this.installInstancePrimitive("hashcode",               HashPrimFactory.getInstance());
        _this.installInstancePrimitive("objectSize",             ObjectSizePrimFactory.getInstance());
        _this.installInstancePrimitive("perform:",               PerformPrimFactory.getInstance());
        _this.installInstancePrimitive("perform:inSuperclass:",  PerformInSuperclassPrimFactory.getInstance());
        _this.installInstancePrimitive("perform:withArguments:", PerformWithArgumentsPrimFactory.getInstance());
        _this.installInstancePrimitive("perform:withArguments:inSuperclass:", PerformWithArgumentsInSuperclassPrimFactory.getInstance());
        _this.installInstancePrimitive("instVarAt:",             InstVarAtPrimFactory.getInstance());
        _this.installInstancePrimitive("instVarAt:put:",         InstVarAtPutPrimFactory.getInstance());
        _this.installInstancePrimitive("instVarNamed:",          InstVarNamedPrimFactory.getInstance());
        _this.installInstancePrimitive("halt",                   HaltPrimFactory.getInstance());
        _this.installInstancePrimitive("class",                  ClassPrimFactory.getInstance());
    }
}
ObjectPrimitives.prototype = Object.create(Primitives.prototype);
som.primitives["Object"] = ObjectPrimitives;
