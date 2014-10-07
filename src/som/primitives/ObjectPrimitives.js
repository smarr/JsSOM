'use strict';

function ObjectPrimitives() {
    Primitives.call(this);
    var _this = this;

    function _equals(frame, args) {
        var op1 = args[1];
        var op2 = args[0];
        if (op1 === op2) {
            return som.trueObject;
        } else {
            return som.falseObject;
        }
    }

    function _hashcode(frame, args) {
        var rcvr = args[0];
        var hash = rcvr.hash;
        if (hash === undefined) {
            hash = Math.round(Math.random() * 2147483647);
            rcvr.hash = hash;
        }
        return universe.newInteger(hash);
    }

    function _objectSize(frame, args) {
        var size = 0;
        var rcvr = args[0];
        if (rcvr instanceof SObject) {
            size = rcvr.getNumberOfFields();
        } else if (rcvr instanceof SArray) {
            size = rcvr.getNumberOfIndexableFields();
        }
        return universe.newInteger(size);
    }
    
    function _perform(frame, args) {
        var selector = args[1];
        var rcvr     = args[0];
        var invokable = rcvr.getClass().lookupInvokable(selector);
        return invokable.invoke(frame, [rcvr]);
    }

    function _performInSuperclass(frame, args) {
        var clazz    = args[2];
        var selector = args[1];
        var rcvr     = args[0];

        var invokable = clazz.lookupInvokable(selector);
        return invokable.invoke(frame, [rcvr]);
    }

    function _performWithArguments(frame, args) {
        var directArgs = args[2].getIndexableFields();
        var selector = args[1];
        var rcvr     = args[0];

        var invokable = rcvr.getClass().lookupInvokable(selector)
        var newArgs = [rcvr].concat(directArgs);
        return invokable.invoke(rcvr, newArgs);
    }

    function _instVarAt(frame, args) {
        var idx = args[1];
        return args[0].getField(idx.getEmbeddedInteger() - 1);
    }

    function _instVarAtPut(frame, args) {
        var val = args[2];
        var idx = args[1];
        args[0].setField(idx.getEmbeddedInteger() - 1, val);
        return val;
    }

    function _instVarNamed(frame, args) {
        var rcvr = args[0];
        var i = rcvr.getFieldIndex(args[1]);
        return rcvr.getField(i);
    }

    function _halt(frame, args) {
        universe.println("BREAKPOINT");
        debugger;
        return args[0];
    }

    function _class(frame, args) {
        return args[0].getClass();
    }

    this.installPrimitives = function () {
        _this.installInstancePrimitive("==",                     _equals);
        _this.installInstancePrimitive("hashcode",               _hashcode);
        _this.installInstancePrimitive("objectSize",             _objectSize);
        _this.installInstancePrimitive("perform:",               _perform);
        _this.installInstancePrimitive("perform:inSuperclass:",  _performInSuperclass);
        _this.installInstancePrimitive("perform:withArguments:", _performWithArguments);
        _this.installInstancePrimitive("perform:withArguments:inSuperclass:", null);  // TODO: primitive implementation missing, also in RTruffleSOM...
        _this.installInstancePrimitive("instVarAt:",             _instVarAt);
        _this.installInstancePrimitive("instVarAt:put:",         _instVarAtPut);
        _this.installInstancePrimitive("instVarNamed:",          _instVarNamed);
        _this.installInstancePrimitive("halt",                   _halt);
        _this.installInstancePrimitive("class",                  _class);
    }
}
ObjectPrimitives.prototype = Object.create(Primitives.prototype);
som.primitives["Object"] = ObjectPrimitives;
