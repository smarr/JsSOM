function Frame(callerFrame, args, numTemps) {
    var isOnStack = true,
        temps     = new Array(numTemps);

    for (var i = 0; i < numTemps; i++) {
        temps[i] = som.nilObject;
    }

    this.getReceiver = function () {
        return args[0];
    };

    this.getArgument = function (idx) {
        return args[idx];
    };

    this.getTemp = function (idx) {
        return temps[idx];
    };

    this.setTemp = function (idx, value) {
        temps[idx] = value;
    };

    this.isOnStack = function () {
        return isOnStack;
    };

    this.dropFromStack = function () {
        isOnStack = false;
    };
}