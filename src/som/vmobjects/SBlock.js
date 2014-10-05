'use strict';

function getBlockEvaluationPrimitive(numberOfArguments, rcvrClass) {
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

    switch (numberOfArguments) {
        case 1: return constructPrimitive(sig,
            ValueNonePrimFactory.getInstance(), universe, rcvrClass);
        case 2: return constructPrimitive(sig,
            ValueOnePrimFactory.getInstance(), universe, rcvrClass);
        case 3: return constructPrimitive(sig,
            ValueTwoPrimFactory.getInstance(), universe, rcvrClass);
        case 4: return constructPrimitive(sig,
            ValueMorePrimFactory.getInstance(), universe, rcvrClass);
        default:
            throw new RuntimeException("Should not reach here. SOM only has blocks with up to 2 arguments.");
    }
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
