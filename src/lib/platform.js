if (typeof global === "undefined") {
    // this seems to be a browser environment
    getMillisecondTicks = function () {
        return performance.now();
    };

    stdout = function (msg) {
        document.write(msg);
    };

    stdoutnl = function (msg) {
        document.writeln(msg + "<br/>");
    };

    stderr = function (msg) {
        document.write("<span style='color:red';>" + msg + "</span>");
    };

    stderrnl = function (msg) {
        document.writeln("<span style='color:red';>" + msg + "<br/></span>")
    };

    exitInterpreter = function (errorCode) {};
} else {
    // this seems to be node.js
    getMillisecondTicks = function () {
        var timeTuple = process.hrtime();
        return timeTuple[0] * 1000 + timeTuple[1]/1000000;
    };

    stdout = function (msg) {
        process.stdout.write(msg);
    };

    stdoutnl = function (msg) {
        process.stdout.write(msg + "\n");
    };

    stderr = function (msg) {
        process.stderr.write(msg);
    };

    stderrnl = function (msg) {
        process.stderr.write(msg + "\n");
    };

    exitInterpreter = function (errorCode) {
        process.exit(errorCode);
    };
}

