'use strict';

function AssertionFailedException() {}

function assert(bool) {
    if (!bool) {
        throw new AssertionFailedException();
    }
}

function NotYetImplementedException() {}

function notYetImplemented() {
    throw new NotYetImplementedException();
}
