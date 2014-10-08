function StringPrimitives() {
    Primitives.call(this);
    var _this = this;

    function _concat(frame, args) {
        var argument = args[1];
        return universe.newString(args[0].getEmbeddedString()
            + argument.getEmbeddedString());
    }

    function _asSymbol(frame, args) {
        return universe.symbolFor(args[0].getEmbeddedString());
    }

    function _length(frame, args) {
        return universe.newInteger(args[0].getEmbeddedString().length);
    }

    function _equals(frame, args) {
        var op1 = args[1];
        var op2 = args[0];
        if (op1 instanceof SString) {
            if (op1.getEmbeddedString() == op2.getEmbeddedString()) {
                return som.trueObject;
            }
        }
        return som.falseObject;
    }

    function _substring(frame, args) {
        var end   = args[2];
        var start = args[1];

        var s = start.getEmbeddedInteger() - 1;
        var e = end.getEmbeddedInteger();
        var string = args[0].getEmbeddedString();

        if (s < 0  ||  s >= string.length  ||  e > string.length  ||  e < s) {
            return universe.newString("Error - index out of bounds");
        } else {
            return universe.newString(string.substring(s, e));
        }
    }

    function _hashcode(frame, args) {
        var s = args[0].getEmbeddedString();

        // hash code from: http://stackoverflow.com/a/7616484/916546
        var hash = 0, i, chr, len;
        if (s.length == 0) {
            return universe.newInteger(hash);
        }

        for (i = 0, len = s.length; i < len; i++) {
            chr   = s.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return universe.newInteger(hash);
    }

    this.installPrimitives = function () {
        _this.installInstancePrimitive("concatenate:",          _concat);
        _this.installInstancePrimitive("asSymbol",              _asSymbol);
        _this.installInstancePrimitive("length",                _length);
        _this.installInstancePrimitive("=",                     _equals);
        _this.installInstancePrimitive("primSubstringFrom:to:", _substring);
        _this.installInstancePrimitive("hashcode",              _hashcode);
    };
}
StringPrimitives.prototype = Object.create(Primitives.prototype);
som.primitives["String"] = StringPrimitives;
