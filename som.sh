#!/bin/sh
pushd `dirname $0` > /dev/null
SCRIPT_PATH=`pwd`
popd > /dev/null

git --work-tree=${SCRIPT_PATH} submodule update --init --recursive > /dev/null 2>&1

exec node ${SCRIPT_PATH}/src/node.js "$@"
