'use strict';

function SClass(_clazz, numberOfFields) {
    SObject.call(this, _clazz, numberOfFields);

    var invokablesTable    = {},
        superclass         = null,
        name               = null,
        instanceInvokables = null,
        instanceFields     = null,
        _this              = this;

    this.getSuperClass = function () {
        return (superclass == null) ? som.nilObject : superclass;
    };

    this.setSuperClass = function (value) {
        superclass = value;
    };

    this.hasSuperClass = function () {
        return superclass != null;
    };

    this.getName = function () {
        return name;
    };

    this.setName = function (value) {
        name = value;
    };

    this.getInstanceFields = function () {
        return instanceFields;
    };

    this.setInstanceFields = function (fieldsArray) {
        assert(fieldsArray instanceof SArray);
        instanceFields = fieldsArray;
    };

    this.getInstanceInvokables = function () {
        return instanceInvokables;
    };

    this.getNumberOfInstanceInvokables = function () {
        // Return the number of instance invokables in this class
        return instanceInvokables.getNumberOfIndexableFields();
    };

    this.setInstanceInvokables = function (arr) {
        assert(arr instanceof SArray);
        instanceInvokables = arr;

        // Make sure this class is the holder of all invokables in the array
        var num = _this.getNumberOfInstanceInvokables();
        for (var i = 0; i < num; i++) {
            instanceInvokables.getIndexableField(i).setHolder(this);
        }
    };

    this.getInstanceInvokable = function (index) {
        return instanceInvokables.getIndexableField(index);
    };

    this.setInstanceInvokable = function (index, value) {
        // Set this class as the holder of the given invokable
        value.setHolder(_this);

        instanceInvokables.setIndexableField(index, value);

        if (invokablesTable[value.getSignature()] == undefined) {
            invokablesTable[value.getSignature()] = value;
        }
    };

    this.lookupInvokable = function (selector) {
        // Lookup invokable and return if found
        var invokable = invokablesTable[selector];
        if (invokable != null) { return invokable; }

        // Lookup invokable with given signature in array of instance invokables
        var num = _this.getNumberOfInstanceInvokables();
        for (var i = 0; i < num; i++) {
            // Get the next invokable in the instance invokable array
            invokable = _this.getInstanceInvokable(i);

            // Return the invokable if the signature matches
            if (invokable.getSignature() == selector) {
                invokablesTable[selector] = invokable;
                return invokable;
            }
        }

        // Traverse the super class chain by calling lookup on the super class
        if (_this.hasSuperClass()) {
            invokable = _this.getSuperClass().lookupInvokable(selector);
            if (invokable != null) {
                invokablesTable[selector] = invokable;
                return invokable;
            }
        }

        // Invokable not found
        return null;
    };

    this.lookupFieldIndex = function (fieldName) {
        // Lookup field with given name in array of instance fields
        var num = _this.getNumberOfInstanceFields();
        for (var i = num - 1; i >= 0; i--) {
            // Return the current index if the name matches
            if (fieldName == _this.getInstanceFieldName(i)) { return i; }
        }
        return -1;  // Field not found
    };

    function addInstanceInvokable(value) {
        // Add the given invokable to the array of instance invokables
        var num = _this.getNumberOfInstanceInvokables();
        for (var i = 0; i < num; i++) {
            // Get the next invokable in the instance invokable array
            var invokable = _this.getInstanceInvokable(i);

            // Replace the invokable with the given one if the signature matches
            if (invokable.getSignature() == value.getSignature()) {
                _this.setInstanceInvokable(i, value);
                return false;
            }
        }

        instanceInvokables.getIndexableFields().push(value);
        return true;
    }

    this.addInstancePrimitive = function (value) {
        if (addInstanceInvokable(value)) {
            universe.print("Warning: Primitive " + value.getSignature().getString());
            universe.println(" is not in class definition for class "
                + _this.getName().getString());
        }
    };

    this.getInstanceFieldName = function (index) {
        return instanceFields.getIndexableField(index);
    };

    this.getNumberOfInstanceFields = function () {
        return instanceFields.getNumberOfIndexableFields();
    };

    function includesPrimitives(clazz) {
        // Lookup invokable with given signature in array of instance invokables
        for (var i = 0; i < clazz.getNumberOfInstanceInvokables(); i++) {
            // Get the next invokable in the instance invokable array
            if (clazz.getInstanceInvokable(i).isPrimitive()) {
                return true;
            }
        }
        return false;
    }

    this.hasPrimitives = function () {
        return includesPrimitives(this) || includesPrimitives(_this.getClass());
    };

    this.loadPrimitives = function (displayWarning) {
        // Compute the class name of the Java(TM) class containing the
        // primitives
        var prims = som.primitives[name.getString()];
        if (prims !== undefined) {
            (new prims()).
                installPrimitivesIn(this);
        } else {
            if (displayWarning) {
                universe.println("Primitives class " + name.getString() + " not found");
            }
        }
    };

    this.toString = function () {
        return "Class(" + name.getString() + ")";
    };
}
SClass.prototype = Object.create(SObject.prototype);
