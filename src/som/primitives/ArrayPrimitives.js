function ArrayPrimitives() {
    Primitives.call(this);
    var _this = this;

    function _at(frame, args) {
        var i = args[1];
        return args[0].getIndexableField(i.getEmbeddedInteger() - 1);
    }

    function _atPut(frame, args) {
        var value = args[2];
        var index = args[1];

        args[0].setIndexableField(index.getEmbeddedInteger() - 1, value);
        return value;
    }

    function _length(frame, args) {
        return universe.newInteger(
            args[0].getNumberOfIndexableFields());
    }

    function _new(frame, args) {
        var length = args[1];
        return universe.newArrayWithLength(length.getEmbeddedInteger())
    }

    function _doIndexes(frame, args) {
        var block = args[1];
        var blockMethod = block.getMethod();

        var length = args[0].getNumberOfIndexableFields();
        for (var i = 1; i <= length; i++) {  // i is propagated to Smalltalk, so, start with 1
            blockMethod.invoke(frame, [block, universe.newInteger(i)]);
        }
        return args[0];
    }

    function _do(frame, args) {
        var block = args[1];
        var blockMethod = block.getMethod();


        var length = args[0].getNumberOfIndexableFields();
        for (var i = 0; i < length; i++) { // array is zero indexed
            blockMethod.invoke(frame, [block, args[0].getIndexableField(i)]);
        }
        return args[0];
    }

    this.installPrimitives = function () {
        _this.installInstancePrimitive("at:",         _at);
        _this.installInstancePrimitive("at:put:",     _atPut);
        _this.installInstancePrimitive("length",      _length);
        _this.installInstancePrimitive("doIndexes:",  _doIndexes);
        _this.installInstancePrimitive("do:",         _do);

        _this.installClassPrimitive("new:", _new);
    }
}
ArrayPrimitives.prototype = Object.create(Primitives.prototype);
som.primitives["Array"] = ArrayPrimitives;
