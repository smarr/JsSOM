function VariableReadNode(contextLevel, local, source) {
    ContextualNode.call(this, contextLevel, source);
    var _this = this;

    this.execute = function (frame) {
        var ctx = _this.determineContext(frame);
        return ctx.getTemp(local.getIndex());
    }
}
VariableReadNode.prototype = Object.create(ContextualNode.prototype);

function VariableWriteNode(contextLevel, local, _valueExpr, source) {
    ContextualNode.call(this, contextLevel, source);
    var _this = this;
    _this._child_value = _this.adopt(_valueExpr);

    this.execute = function (frame) {
        var val = _this._child_value.execute(frame);

        var ctx = _this.determineContext(frame);
        ctx.setTemp(local.getIndex(), val);
        return val;
    }
}
VariableReadNode.prototype = Object.create(ContextualNode.prototype);

