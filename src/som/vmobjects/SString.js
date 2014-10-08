function SString(value) {
    SAbstractObject.call(this);

    this.getEmbeddedString = function () {
        return value;
    };

    this.getClass = function () {
        return som.stringClass;
    };
}
SString.prototype = Object.create(SAbstractObject.prototype);
