#!/usr/bin/env make -f

JS_SRC=$(shell libs/deps.py)

all: build/som.min.js build/node.min.js

src_gen:
	mkdir src_gen

test: build/node.min.js
	./som.sh -cp Smalltalk TestSuite/TestHarness.som

build:
	mkdir build

build/closure-compiler: build
	mkdir build/closure-compiler
	wget http://dl.google.com/closure-compiler/compiler-latest.zip -O build/closure-compiler/compiler-latest.zip
	unzip build/closure-compiler/compiler-latest.zip -d build/closure-compiler/

build/som.min.js: build $(JS_SRC) build/closure-compiler
	java -jar build/closure-compiler/compiler.jar --language_in=ECMASCRIPT5 --js_output_file=$@ $(JS_SRC)

build/node.min.js: build $(JS_SRC) src/som/vm/Shell.js src/node.js
	java -jar build/closure-compiler/compiler.jar --language_in=ECMASCRIPT5 --js_output_file=$@ $(JS_SRC) src/som/vm/Shell.js src/node.js

src_gen/core_lib.js: core-lib src_gen
	libs/jsify-core-lib.py > $@

core-lib: core-lib/Smalltalk

core-lib/Smalltalk:
	git submodules init
	git submodules update

libs/big-integer/BigInteger.js:
	git submodules init
	git submodules update

clean:
	@rm -Rf build
	@rm -Rf src_gen
