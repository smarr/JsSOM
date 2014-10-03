#!/usr/bin/env make -f

all: minify

minify: src_gen/core_lib.js
	echo TODO

src_gen:
	mkdir src_gen

src_gen/core_lib.js: core-lib src_gen
	libs/jsify-core-lib.py > $@

core-lib:
	git submodules init
	git submodules update
