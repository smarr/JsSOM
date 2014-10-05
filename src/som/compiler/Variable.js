
function Variable (name) {
    var _this = this;

    this.getReadNode = function (contextLevel, source) {
        return createVariableRead(_this, contextLevel, source);
    };

    this.getSuperReadNode = function (contextLevel, holderClass, classSide, source) {
        return createSuperRead(
            _this, contextLevel, holderClass, classSide, source);
    };
}

function Argument(name, index) {
    Variable.call(this, name);

    this.toString = function () {
        return "Argument(" + name + ")";
    };

    this.isSelf = function () {
        return "self" == name || "$blockSelf" == name;
    }
}

function Local(name) {
    Variable.call(this, name);

    this.toString = function () {
        return "Local(" + name + ")";
    };

    this.getWriteNode = function (contextLevel, valueExpr, source) {
        return createVariableWrite(this, contextLevel, valueExpr, source);
    }
}
