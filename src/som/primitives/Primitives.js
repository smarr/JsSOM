'use strict';


function constructPrimitive(signature, nodeFactory, holder) {
    var numArgs = signature.getNumberOfSignatureArguments();

    var args = [];
    for (var i = 0; i < numArgs; i++) {
        args[i] = new ArgumentReadNode(i);
    }

    var primNode;
    switch (numArgs) {
        case 1:
            primNode = nodeFactory.createNode(args[0]);
            break;
        case 2:
            primNode = nodeFactory.createNode(args[0], args[1]);
            break;
        case 3:
            primNode = nodeFactory.createNode(args[0], args[1], args[2]);
            break;
        case 4:
            primNode = nodeFactory.createNode(args[0], args[1], args[2], args[3]);
            break;
        default:
            throw new RuntimeException("Not supported by SOM.");
    }

    return universe.newMethod(signature, primNode, true, []);
}

function constructEmptyPrimitive(signature) {
    var primNode = new EmptyPrim(new ArgumentReadNode(0));
    return universe.newMethod(signature, primNode, true, []);
}

function Primitives () {
    var holder = null,
        _this = this;

    this.installPrimitivesIn = function (value) {
        holder = value;

        // Install the primitives from this primitives class
        _this.installPrimitives();
    };

    this.installInstancePrimitive = function (selector, nodeFactory) {
        var signature = universe.symbolFor(selector);
        var prim = constructPrimitive(signature, nodeFactory, universe, holder);

        // Install the given primitive as an instance primitive in the holder class
        holder.addInstancePrimitive(prim);
    };

    this.installClassPrimitive = function (selector, nodeFactory) {
        var signature = universe.symbolFor(selector);
        var prim = constructPrimitive(signature, nodeFactory, universe, holder);

        // Install the given primitive as an instance primitive in the class of
        // the holder class
        holder.getClass().addInstancePrimitive(prim);
    };

    this.getEmptyPrimitive = function (selector) {
        var signature = universe.symbolFor(selector);
        return constructEmptyPrimitive(signature);
    }
}
