#!/bin/bash
pushd `dirname $0` > /dev/null
SCRIPT_PATH=`pwd`
popd > /dev/null

if [ ! -f "${SCRIPT_PATH}/core-lib/.git" ]
then
  echo Initializing core-lib submodule to have access to the required standard library
  git --work-tree=${SCRIPT_PATH} submodule update --init --recursive > /dev/null 2>&1
fi

exec node ${SCRIPT_PATH}/src/node.js "$@"
