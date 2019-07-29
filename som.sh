#!/bin/sh
git submodule update --init --recursive > /dev/null 2>&1

exec node src/node.js "$@"
