function SequenceNode(_expressions, source) {
    Node.call(this, source);
    var _this = this;
    _this._children_exprs = _expressions;

    this.execute = function (frame) {
        for (var i = 0; i < _this._children_exprs.length - 1; i++) {
            _this._children_exprs[i].execute(frame);
        }
        return _this._children_exprs[_this._children_exprs.length - 1].execute(frame);
    };
}
SequenceNode.prototype = Object.create(Node.prototype);
