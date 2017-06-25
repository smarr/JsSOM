#!/usr/bin/env make -f

JS_SRC=$(shell libs/deps.py)
CLOJURE_JAR=build/closure-compiler/compiler.jar

all: build/som.min.js build/node.min.js build/som.full.js build/som-repl.min.js build/som-repl.full.js

src_gen:
	mkdir src_gen

test: build/node.min.js
	./som.sh -cp Smalltalk TestSuite/TestHarness.som

travis_deps:
	sudo apt-get install -qq python-yaml

$(CLOJURE_JAR):
	-mkdir -p build/closure-compiler
	wget http://dl.google.com/closure-compiler/compiler-latest.zip -O build/closure-compiler/compiler-latest.zip
	unzip build/closure-compiler/compiler-latest.zip -d build/closure-compiler/
	mv build/closure-compiler/closure-compiler-*.jar build/closure-compiler/compiler.jar

build/som.min.js: $(JS_SRC) $(CLOJURE_JAR)
	java -jar $(CLOJURE_JAR) --language_in=ECMASCRIPT6_STRICT --js_output_file=$@ $(JS_SRC)

build/node.min.js: $(JS_SRC) src/som/vm/Shell.js src/node.js
	java -jar $(CLOJURE_JAR) --language_in=ECMASCRIPT6_STRICT --js_output_file=$@ $(JS_SRC) src/som/vm/Shell.js src/node.js

build/som.full.js: $(JS_SRC)
	cat $(JS_SRC) > $@

build/som-repl.full.js: $(JS_SRC) src/web-repl.js
	cat $(JS_SRC) src/web-repl.js > $@

build/som-repl.min.js: $(JS_SRC) src/web-repl.js $(CLOJURE_JAR)
	java -jar $(CLOJURE_JAR) --language_in=ECMASCRIPT6_STRICT --js_output_file=$@ $(JS_SRC) src/web-repl.js

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
