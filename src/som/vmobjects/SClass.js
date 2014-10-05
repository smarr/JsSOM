'use strict';

function SClass(_clazz, numberOfFields) {
    SObject.call(this, _clazz, numberOfFields);

    var invokablesTable    = {},
        superclass         = null,
        name               = null,
        instanceInvokables = new Array(),
        instanceFields     = new Array(),
        _this              = this;

    this.getSuperClass = function () {
        return superclass;
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
        instanceFields = fieldsArray;
    };

    this.getInstanceInvokables = function () {
        return instanceInvokables;
    };

    this.setInstanceInvokables = function (arr) {
        instanceInvokables = arr;

        // Make sure this class is the holder of all invokables in the array
        var num = getNumberOfInstanceInvokables();
        for (var i = 0; i < num; i++) {
            instanceInvokables[i].setHolder(this);
        }
    };

    this.getNumberOfInstanceInvokables = function () {
        // Return the number of instance invokables in this class
        return instanceInvokables.length;
    };

    this.getInstanceInvokable = function (index) {
        return instanceInvokables[index];
    };

    this.setInstanceInvokable = function (index, value) {
        // Set this class as the holder of the given invokable
        value.setHolder(this);

        instanceInvokables[index] = value;

        if (invokablesTable.containsKey(value.getSignature())) {
            invokablesTable.put(value.getSignature(), value);
        }
    };

    this.lookupInvokable = function (selector) {
        // Lookup invokable and return if found
        var invokable = invokablesTable.get(selector);
        if (invokable != null) { return invokable; }

        // Lookup invokable with given signature in array of instance invokables
        var num = getNumberOfInstanceInvokables();
        for (var i = 0; i < num; i++) {
            // Get the next invokable in the instance invokable array
            invokable = getInstanceInvokable(i);

            // Return the invokable if the signature matches
            if (invokable.getSignature() == selector) {
                invokablesTable.put(selector, invokable);
                return invokable;
            }
        }

        // Traverse the super class chain by calling lookup on the super class
        if (hasSuperClass()) {
            invokable = getSuperClass().lookupInvokable(selector);
            if (invokable != null) {
                invokablesTable.put(selector, invokable);
                return invokable;
            }
        }

        // Invokable not found
        return null;
    };

    this.lookupFieldIndex = function (fieldName) {
        // Lookup field with given name in array of instance fields
        var num = getNumberOfInstanceFields();
        for (var i = num - 1; i >= 0; i--) {
            // Return the current index if the name matches
            if (fieldName == getInstanceFieldName(i)) { return i; }
        }
        return -1;  // Field not found
    };

    function addInstanceInvokable(value) {
        // Add the given invokable to the array of instance invokables
        var num = getNumberOfInstanceInvokables();
        for (var i = 0; i < num; i++) {
            // Get the next invokable in the instance invokable array
            var invokable = getInstanceInvokable(i);

            // Replace the invokable with the given one if the signature matches
            if (invokable.getSignature() == value.getSignature()) {
                setInstanceInvokable(i, value);
                return false;
            }
        }

        // Append the given method to the array of instance methods
        var numInvokables = instanceInvokables.length;
        instanceInvokables = Arrays.copyOf(instanceInvokables, numInvokables + 1);
        instanceInvokables[numInvokables] = value;
        return true;
    }

    this.addInstancePrimitive = function (value) {
        if (addInstanceInvokable(value)) {
            universe.print("Warning: Primitive " + value.getSignature().getString());
            universe.println(" is not in class definition for class "
                + getName().getString());
        }
    };

    this.getInstanceFieldName = function (index) {
        return instanceFields[index];
    };

    this.getNumberOfInstanceFields = function () {
        return instanceFields.length;
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
        if (som.primitives[getName().getString()] !== undefined) {
            som.primitives[getName().getString()].installPrimitivesIn(this);
        } else {
            if (displayWarning) {
                Universe.println("Primitives class " + className + " not found");
            }
        }
    };

    this.toString = function () {
        return "Class(" + _this.getName().getString() + ")";
    };
}

SClass.prototype = Object.create(SObject.prototype);
