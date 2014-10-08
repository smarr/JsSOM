JsSOM - The SOM (Simple Object Machine) Smalltalk implemented in JavaScript
===========================================================================

Introduction
------------

[SOM][SOM-st] is a minimal Smalltalk dialect used to teach VM construction. It
was originally built at the University of Århus (Denmark) where it was used for
teaching and as the foundation for [Resilient Smalltalk][RS]. Later is was also
used for instance at the [Hasso Plattner Institute (Potsdam, Germany)][SOM].

In addition to JsSOM, [other implementations][github] exist for Java (SOM,
TruffleSOM), C (CSOM), C++ (SOM++), Python (PySOM), RPython (RPySOM,
RTruffleSOM) and Squeak/Pharo Smalltalk (AweSOM).

A simple Hello World looks like:

```Smalltalk
Hello = (
  run = (
    'Hello World!' println.
  )
)
```

This repository contains a JavaScript-based implementation of SOM, including
SOM's standard library and a number of examples. JsSOM is a simple abstract
syntax tree interpreter. It isn't optimized or tuned for performance. However,
some aspects were easier to implement by doing node-replacement in a
self-optimizing interpreter style.

JsSOM's tests can be executed with:

    $ make  # note, it will download the Google Closure compiler
    $ ./som.sh -cp Smalltalk TestSuite/TestHarness.som
   
A simple Hello World program is executed with:

    $ ./som.sh -cp Smalltalk Examples/Hello/Hello.som

This code is distributed under the MIT License. Please see the LICENSE file for
details. JsSOM uses [BigInteger.js][big-int] to support arbitrary-length
integer operations.

Build Status
------------

Thanks to Travis CI, all commits of this repository are tested.
The current build status is: [![Build Status](https://travis-ci.org/SOM-st/JsSOM.png?branch=master)](https://travis-ci.org/SOM-st/JsSOM)

 [SOM-st]: http://som-st.github.io
 [github]: http://github.com/SOM-st/
 [SOM]:    http://www.hpi.uni-potsdam.de/hirschfeld/projects/som/
 [RS]:     http://dx.doi.org/10.1016/j.cl.2005.02.003
 [big-int]:https://www.npmjs.org/package/big-integer
