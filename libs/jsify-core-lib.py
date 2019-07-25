#!/usr/bin/env python

## This script takes the give .som files names and produces a hash map with
## folders and files, which is then output as JSON. The JS script stores a
## loadCoreLib() function in exports to make the result accessible.

import json
import os
import sys

core_lib = {}

def add_to_lib(lib, file_name, content):
    split_name = file_name.split('/')
    path = split_name[:-1]
    file = split_name[-1]

    current = lib
    for p in path:
        if not p in current:
            current[p] = {}
        current = current[p]
    current[file] = content

for dir_name in sys.argv[1:]:
    for root, dirs, file_names in os.walk(dir_name):
        for file_name in file_names:
            if file_name.endswith(".som"):
                full_name = root + '/' + file_name
                with open(full_name, 'r') as f:
                    content = f.read()
                add_to_lib(core_lib, full_name, content)


print("exports.loadCoreLib = function () { return %s; };" % json.dumps(core_lib))
