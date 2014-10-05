'use strict';

function createCatchNonLocalReturn(methodBody) {
    return new CatchNonLocalReturnNode(methodBody);
}

function createFieldRead(self, fieldIndex, source) {
    return new FieldReadNode(self, fieldIndex, source);
}

function createGlobalRead(name, source) {
    assert(name instanceof SSymbol);
    return new UninitializedGlobalReadNode(name, source);
}

function createFieldWrite(self, exp, fieldIndex, source) {
    return FieldWriteNodeFactory.create(fieldIndex, source, self, exp);
}

function createVariableRead(variable, contextLevel, source) {
    return new UninitializedVariableReadNode(variable, contextLevel, source);
}

function createSuperRead(variable, contextLevel, holderClass, classSide, source) {
    assert(holderClass instanceof SSymbol);
    return new UninitializedSuperReadNode(variable, contextLevel, holderClass,
        classSide, source);
}

function createVariableWrite(variable, contextLevel, exp, source) {
    return new UninitializedVariableWriteNode(variable, contextLevel, exp, source);
}

function createSequence(exps, source) {
    return new SequenceNode(exps, source);
}

function createBlockNode(blockMethod, source) {
    return new BlockNode(blockMethod, source);
}

function createMessageSend(msg, exprs, source) {
    return new MessageSendNode(msg, exprs,
        new GenericDispatchNode(msg), source);
}

function createSuperSend(msg, exprs, source) {
    return new MessageSendNode(msg, exprs, new SuperDispatchNode(msg,
            exprs[0].getSuperClass()), source);
}

function createNonLocalReturn(exp, markerSlot, contextLevel, source) {
    return new ReturnNonLocalNode(exp, markerSlot, contextLevel, source);
}