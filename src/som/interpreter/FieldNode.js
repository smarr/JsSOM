'use strict';

function FieldReadNode(_selfExp, fieldIdx, source) {
    Node.call(this, source);
    assert(fieldIdx >= 0);
    var _this = this;

    _this._child_self = _this.adopt(_selfExp);

    this.execute = function (frame) {
        var self = _this._child_self.execute(frame);
        return self.getField(fieldIdx);
    }
}
FieldReadNode.prototype = Object.create(Node.prototype);

function FieldWriteNode(_selfExp, _valueExp, fieldIdx, source) {
    Node.call(this, source);
    assert(fieldIdx >= 0);
    var _this = this;

    _this._child_self  = _this.adopt(_selfExp);
    _this._child_value = _this.adopt(_valueExp);

    this.execute = function (frame) {
        var self  = _this._child_self.execute(frame);
        var value = _this._child_value.execute(frame);
        self.setField(fieldIdx, value);
        return value;
    };
}
FieldWriteNode.prototype = Object.create(Node.prototype);
