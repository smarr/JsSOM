'use strict';

function SSymbol(value) {
    SAbstractObject.call(this);
    var string = value,
        numberOfSignatureArguments = determineNumberOfSignatureArguments();

    this.getClass = function () {
        return som.symbolClass;
    };

    this.getString = function () {
        // Get the string associated to this symbol
        return string;
    };

    function determineNumberOfSignatureArguments() {
        // Check for binary signature
        if (isBinarySignature()) {
            return 2;
        } else {
            // Count the colons in the signature string
            var numberOfColons = 0;

            // Iterate through every character in the signature string
            for (var c in string) {
                if (c == ':') { numberOfColons++; }
            }

            // The number of arguments is equal to the number of colons plus one
            return numberOfColons + 1;
        }
    }

    this.toString = function () {
        return "#" + string;
    };

    this.getNumberOfSignatureArguments = function () {
        return numberOfSignatureArguments;
    };

    function isBinarySignature() {
        // Check the individual characters of the string
        for (var c in string) {
            if (c != '~' && c != '&' && c != '|' && c != '*' && c != '/' && c != '@'
                && c != '+' && c != '-' && c != '=' && c != '>' && c != '<'
                && c != ',' && c != '%' && c != '\\') { return false; }
        }
        return true;
    }

    Object.freeze(this);
}

SSymbol.prototype = Object.create(SAbstractObject.prototype);
