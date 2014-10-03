#!/usr/bin/env python

## This script traverses the core-lib folder and reads all .som files
## It takes these files and produces a hash map with folders and files, which
## is then output as JSON. The JS script stores a loadCoreLib() function in
## window to make the result accessible.

import json
import os

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
    

for root, dirs, files in os.walk('core-lib'):
    for file in files:
        if file.endswith('.som'):
            file_name = os.path.join(root, file)
            with open(file_name, 'r') as f:
                content = f.read()
            add_to_lib(core_lib, file_name, content)

print "'use strict'; window.loadCoreLib = function () { return %s; };" % json.dumps(core_lib['core-lib'])
