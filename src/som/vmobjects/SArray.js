function SArray(length, values) {
    SAbstractObject.call(this);
    var indexableFields = (values != null) ? values : new Array(length);

    if (values == null) {
        for (var i = 0; i < length; i++) {
            indexableFields[i] = som.nilObject;
        }
    }

    this.getIndexableField = function (idx) {
        return indexableFields[idx];
    };

    this.setIndexableField = function (idx, value) {
        indexableFields[idx] = value;
    };

    this.getIndexableFields = function () {
        return indexableFields;
    };

    this.getNumberOfIndexableFields = function () {
        return length;
    };

    function copyIndexableFields(to) {
        for (var i = 0; i < length; i++) {
            to.setIndexableField(i, indexableFields[i]);
        }
    }

    this.copyAndExtendWith = function (value) {
        var result = new SArray(length + 1);
        copyIndexableFields(result);
        result.setIndexableField(length, value);
    };

    this.getClass = function () {
        return som.arrayClass;
    };
}
SArray.prototype = Object.create(SAbstractObject.prototype);
