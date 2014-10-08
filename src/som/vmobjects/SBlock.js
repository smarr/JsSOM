function getBlockEvaluationPrimitive(numberOfArguments, rcvrClass) {
    function _value(frame, args) {
        var rcvrBlock = args[0];
        return rcvrBlock.getMethod().invoke(frame, args);
    }

    function computeSignatureString() {
        // Compute the signature string
        var signatureString = "value";
        if (numberOfArguments > 1) { signatureString += ":"; }

        // Add extra value: selector elements if necessary
        for (var i = 2; i < numberOfArguments; i++) {
            signatureString += "with:";
        }
        return signatureString;
    }

    var sig = universe.symbolFor(computeSignatureString(numberOfArguments));
    return universe.newPrimitive(sig, _value, rcvrClass);
}

function SBlock(blockMethod, context) {
    SAbstractObject.call(this);
    var blockClass = som.blockClasses[blockMethod.getNumberOfArguments()];

    this.getClass = function () {
        return blockClass;
    };

    this.getMethod = function () {
        return blockMethod;
    };

    this.getContext = function () {
        return context;
    };

    this.getOuterSelf = function () {
        assert(context != null);
        return context.getReceiver();
    };
}
SBlock.prototype = Object.create(SAbstractObject.prototype);
