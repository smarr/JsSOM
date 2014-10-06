'use strict';

function MethodGenerationContext(holderGenc, outerGenc, blockMethod) {
    var signature = null,
        primitive = false,
        needsToCatchNonLocalReturn      = false,
        throwsNonLocalReturn            = false,
        accessesVariablesOfOuterContext = false,
        args       = [],
        argNames   = [],
        locals     = [],
        localNames = [],
        _this      = this;

    this.makeCatchNonLocalReturn = function () {
        throwsNonLocalReturn = true;

        var ctx = _this.getOuterContext();
        ctx.needsToCatchNonLocalReturn = true;
    };

    this.requiresContext = function () {
        return throwsNonLocalReturn || accessesVariablesOfOuterContext;
    };

    this.getOuterContext = function () {
        if (outerGenc == null) {
            return _this;
        } else {
            return outerGenc.getOuterContext();
        }
    };

    this.needsToCatchNonLocalReturn = function () {
        // only the most outer method needs to catch
        return needsToCatchNonLocalReturn && outerGenc == null;
    };

    this.assemble = function (body, sourceSection) {
        if (primitive) {
            return constructEmptyPrimitive(signature);
        }

        if (needsToCatchNonLocalReturn) {
            body = createCatchNonLocalReturn(body);
        }

        // return the method - the holder field is to be set later on!
        return  universe.newMethod(signature,
            getSourceSectionForMethod(sourceSection), body);
    };

    function getSourceSectionForMethod(ssBody) {
        return new SourceSection(
                holderGenc.getName().getString() + ">>" + signature.toString(),
                ssBody.startLine(), ssBody.startColumn(),
                ssBody.charIndex(), ssBody.length());
    }

    this.markAsPrimitive = function () {
        primitive = true;
    };

    this.setSignature = function (sig) {
        signature = sig;
    };

    function addArgument(arg) {
        if (("self" == arg || "$blockSelf" == arg) && args.length > 0) {
            throw new IllegalStateException("The self argument always has to be the first argument of a method");
        }

        var argument = new Argument(arg, args.length);
        args.push(argument);
        argNames.push(arg);
    }

    this.addArgumentIfAbsent = function (arg) {
        if (argNames.indexOf(arg) != -1) {
            return;
        }
        addArgument(arg);
    };

    this.addLocalIfAbsent = function (local) {
        if (localNames.indexOf(local) != -1) {
            return;
        }
        addLocal(local);
    };

    function addLocal(local) {
        var l = new Local(local);
        locals.push(l);
        localNames.push(local);
    }

    this.isBlockMethod = function () {
        return blockMethod;
    };

    this.getHolder = function () {
        return holderGenc;
    };

    this.getOuterSelfContextLevel = function () {
        if (outerGenc == null) {
            return 0;
        } else {
            return outerGenc.getOuterSelfContextLevel() + 1;
        }
    };

    this.getContextLevel = function (varName) {
        if (localNames.indexOf(varName) != -1
            || argNames.indexOf(varName) != -1) {
            return 0;
        }

        if (outerGenc != null) {
            return 1 + outerGenc.getContextLevel(varName);
        }
        return 0;
    };

    this.getVariable = function (varName) {
        var i = localNames.indexOf(varName);
        if (i != -1) {
            return locals[i];
        }

        i = argNames.indexOf(varName);
        if (i != -1) {
            return args[i];
        }

        if (outerGenc != null) {
            var outerVar = outerGenc.getVariable(varName);
            if (outerVar != null) {
                accessesVariablesOfOuterContext = true;
            }
            return outerVar;
        }
        return null;
    };

    this.getSuperReadNode = function (source) {
        var self = _this.getVariable("self");
        return self.getSuperReadNode(_this.getOuterSelfContextLevel(),
            holderGenc.getName(), holderGenc.isClassSide(), source);
    };

    this.getLocalReadNode = function (variableName, source) {
        var variable = _this.getVariable(variableName);
        return variable.getReadNode(_this.getContextLevel(variableName), source);
    };

    this.getLocalWriteNode = function (variableName, valExpr, source) {
        var variable = _this.getLocal(variableName);
        return variable.getWriteNode(_this.getContextLevel(variableName),
            valExpr, source);
    };

    this.getLocal = function (varName) {
        var i = localNames.indexOf(varName);
        if (i != -1) {
            return locals[i];
        }

        if (outerGenc != null) {
            var outerLocal = outerGenc.getLocal(varName);
            if (outerLocal != null) {
                accessesVariablesOfOuterContext = true;
            }
            return outerLocal;
        }
        return null;
    };

    this.getNonLocalReturn = function (expr, source) {
        _this.makeCatchNonLocalReturn();
        return createNonLocalReturn(expr, _this.getOuterSelfContextLevel(),
            source);
    };

    function getSelfRead(source) {
        return _this.getVariable("self").getReadNode(
            _this.getContextLevel("self"), source);
    }

    this.getObjectFieldRead = function (fieldName, source) {
        if (!holderGenc.hasField(fieldName)) {
            return null;
        }
        return createFieldRead(getSelfRead(source),
            holderGenc.getFieldIndex(fieldName), source);
    };

    this.getGlobalRead = function (varName, source) {
        return createGlobalRead(varName, universe, source);
    };

    this.getObjectFieldWrite = function (fieldName, exp, source) {
        if (!holderGenc.hasField(fieldName)) {
            return null;
        }

        return createFieldWrite(getSelfRead(source), exp,
            holderGenc.getFieldIndex(fieldName), source);
    };

    /**
     * @returns {Number} of explicit arguments,
     *         i.e., excluding the implicit 'self' argument
     */
    this.getNumberOfArguments = function () {
        return args.length;
    };

    this.getSignature = function () {
        return signature;
    };

    this.toString = function () {
        return "MethodGenC(" + holderGenc.getName().getString() + ">>" + signature.toString() + ")";
    };
}
