function SObject(instanceClass, numFields) {
    SAbstractObject.call(this);
    var clazz = instanceClass,
        objectFields = new Array((instanceClass === null) ?
            numFields : instanceClass.getNumberOfInstanceFields());

    for (var i = 0; i < objectFields.length; i++) {
        objectFields[i] = som.nilObject;
    }

    this.getNumberOfFields = function () {
        return objectFields.length;
    };

    this.setClass = function (value) {
        clazz = value;
    };

    this.getClass = function () {
        return clazz;
    };

    this.getFieldIndex = function (fieldNameSymbol) {
        return clazz.lookupFieldIndex(fieldNameSymbol);
    };

    this.getField = function (index) {
        return objectFields[index];
    };

    this.setField = function (idx, value) {
        objectFields[idx] = value;
    };
}

SObject.prototype = Object.create(SAbstractObject.prototype);
