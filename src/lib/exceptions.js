'use strict';

function IllegalStateException(msg) {
    this.getMessage = function () { return msg; }
}

function FileNotFoundException(msg) {
    this.getMessage = function () { return msg; }
}

function RuntimeException(msg) {
    this.getMessage = function () { return msg; }
}
