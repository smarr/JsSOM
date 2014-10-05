'use strict';

function isIdentifier(sym) {
    return sym == Sym.Identifier || sym == Sym.Primitive;
}

function printableSymbol(sym) {
    return sym == Sym.Integer || sym == Sym.Double || sym >= Sym.STString;
}

function ParseError(message, expected, parser) {
    var sourceCoordinate = parser.getCoordinate(),
        text             = parser.getText(),
        currentLine      = parser.getLexer().getCurrentLine(),
        fileName         = parser.getFileName(),
        found            = parser.getSym(),
        _this            = this;

    this.expectedSymbolAsString = function () {
        return expected.toString();
    };

    this.toString = function () {
        var msg = "%(file)s:%(line)d:%(column)d: error: " + message;
        var foundStr;
        if (printableSymbol(found)) {
            foundStr = found + " (" + text + ")";
        } else {
            foundStr = found.toString();
        }
        msg += ": " + currentLine;
        var expectedStr = _this.expectedSymbolAsString();

        msg = msg.replace("%(file)s",     fileName);
        msg = msg.replace("%(line)d",     sourceCoordinate.startLine);
        msg = msg.replace("%(column)d",   sourceCoordinate.startColumn);
        msg = msg.replace("%(expected)s", expectedStr);
        msg = msg.replace("%(found)s",    foundStr);
        return msg;
    }
}

function ParseErrorWithSymbolList (message, expected, parser) {
    ParseError.call(this, message, null, parser);

    this.expectedSymbolAsString = function () {
        var sb = "";
        var deliminator = "";

        expected.forEach(function (s) {
            sb += deliminator;
            sb += s;
            deliminator = ", "
        });
        return sb;
    }
}
ParseErrorWithSymbolList.prototype = Object.create(ParseError.prototype);

function Parser(fileContent, fileName) {
    var lexer = new Lexer(fileContent),
        sym = Sym.NONE,
        text = null,
        nextSym = Sym.NONE,
        lastMethodsSourceSection = null,
        singleOpSyms = [Sym.Not,   Sym.And,  Sym.Or,    Sym.Star, Sym.Div,
                        Sym.Mod,   Sym.Plus, Sym.Equal, Sym.More, Sym.Less,
                        Sym.Comma, Sym.At,   Sym.Per,   Sym.NONE],
        binaryOpSyms = [Sym.Or,   Sym.Comma, Sym.Minus, Sym.Equal, Sym.Not,
                        Sym.And,  Sym.Or,    Sym.Star,  Sym.Div,   Sym.Mod,
                        Sym.Plus, Sym.Equal, Sym.More,  Sym.Less,  Sym.Comma,
                        Sym.At,   Sym.Per,   Sym.NONE],
        keywordSelectorSyms = [Sym.Keyword, Sym.KeywordSequence],
        _this = this;

    this.getText = function () {
        return text;
    };

    this.getLexer = function () {
        return lexer;
    };

    this.getFileName = function () {
        return fileName;
    };

    this.getSym = function () {
        return sym;
    }

    this.toString = function () {
        return "Parser(" + source.getName() + ", "
            + _this.getCoordinate().toString() + ")";
    };

    this.getCoordinate = function () {
        return lexer.getStartCoordinate();
    };

    this.classdef = function (cgenc) {
        cgenc.setName(universe.symbolFor(text));
        expect(Sym.Identifier);
        expect(Sym.Equal);

        superclass(cgenc);

        expect(Sym.NewTerm);
        instanceFields(cgenc);

        while (isIdentifier(sym) || sym == Sym.Keyword
            || sym == Sym.OperatorSequence || symIn(binaryOpSyms)) {
            var mgenc = new MethodGenerationContext(cgenc);
            var methodBody = method(mgenc);
            cgenc.addInstanceMethod(
                mgenc.assemble(methodBody, lastMethodsSourceSection));
        }

        if (accept(Sym.Separator)) {
            cgenc.setClassSide(true);
            classFields(cgenc);
            while (isIdentifier(sym) || sym == Sym.Keyword
                || sym == Sym.OperatorSequence || symIn(binaryOpSyms)) {
                var mgenc = new MethodGenerationContext(cgenc);
                var methodBody = method(mgenc);
                cgenc.addClassMethod(
                    mgenc.assemble(methodBody, lastMethodsSourceSection));
            }
        }
        expect(Sym.EndTerm);
    }

    function superclass(cgenc) {
        var superName;
        if (sym == Sym.Identifier) {
            superName = universe.symbolFor(text);
            accept(Sym.Identifier);
        } else {
            superName = universe.symbolFor("Object");
        }
        cgenc.setSuperName(superName);

        // Load the super class, if it is not nil (break the dependency cycle)
        if (!superName.getString() == "nil") {
            var superClass = universe.loadClass(superName);
            if (superClass == null) {
                throw new ParseError("Super class " + superName.getString() +
                    " could not be loaded", Sym.NONE, _this);
            }

            cgenc.setInstanceFieldsOfSuper(superClass.getInstanceFields());
            cgenc.setClassFieldsOfSuper(superClass.getClass().getInstanceFields());
        }
    }

    function symIn(ss) {
        return ss.indexOf(sym) != -1;
    }

    function accept(s) {
        if (sym == s) {
            getSymbolFromLexer();
            return true;
        }
        return false;
    }

    function acceptOneOf(ss) {
        if (symIn(ss)) {
            getSymbolFromLexer();
            return true;
        }
        return false;
    }

    function expect(s) {
        if (accept(s)) { return true; }

        throw new ParseError("Unexpected symbol. Expected %(expected)s, but found "
            + "%(found)s", s, _this);
    }

    function expectOneOf(ss) {
        if (acceptOneOf(ss)) { return true; }

        throw new ParseErrorWithSymbolList("Unexpected symbol. Expected one of " +
            "%(expected)s, but found %(found)s", ss, _this);
    }

    function instanceFields(cgenc) {
        if (accept(Sym.Or)) {
            while (isIdentifier(sym)) {
                var v = variable();
                cgenc.addInstanceField(universe.symbolFor(v));
            }
            expect(Sym.Or);
        }
    }

    function classFields(cgenc) {
        if (accept(Sym.Or)) {
            while (isIdentifier(sym)) {
                var v = variable();
                cgenc.addClassField(universe.symbolFor(v));
            }
            expect(Sym.Or);
        }
    }

    function getSource(coord) {
        return source.createSection("method", coord.startLine,
            coord.startColumn, coord.charIndex,
                lexer.getNumberOfCharactersRead() - coord.charIndex);
    }

    function method(mgenc) {
        pattern(mgenc);
        expect(Sym.Equal);
        if (sym == Sym.Primitive) {
            mgenc.markAsPrimitive();
            primitiveBlock();
            return null;
        } else {
            return methodBlock(mgenc);
        }
    }

    function primitiveBlock() {
        expect(Sym.Primitive);
    }

    function pattern(mgenc) {
        mgenc.addArgumentIfAbsent("self"); // TODO: can we do that optionally?
        switch (sym) {
            case Sym.Identifier:
            case Sym.Primitive:
                unaryPattern(mgenc);
                break;
            case Sym.Keyword:
                keywordPattern(mgenc);
                break;
            default:
                binaryPattern(mgenc);
                break;
        }
    }

    function unaryPattern(mgenc) {
        mgenc.setSignature(unarySelector());
    }

    function binaryPattern(mgenc) {
        mgenc.setSignature(binarySelector());
        mgenc.addArgumentIfAbsent(argument());
    }

    function keywordPattern(mgenc) {
        var kw = "";
        do {
            kw += keyword();
            mgenc.addArgumentIfAbsent(argument());
        }
        while (sym == Sym.Keyword);

        mgenc.setSignature(universe.symbolFor(kw.toString()));
    }

    function methodBlock(mgenc) {
        expect(Sym.NewTerm);
        var coord = _this.getCoordinate();
        var methodBody = blockContents(mgenc);
        lastMethodsSourceSection = getSource(coord);
        expect(Sym.EndTerm);

        return methodBody;
    }

    function unarySelector() {
        return universe.symbolFor(identifier());
    }

    function binarySelector() {
        var s = test;

        if (accept(Sym.Or)) {
        } else if (accept(Sym.Comma)) {
        } else if (accept(Sym.Minus)) {
        } else if (accept(Sym.Equal)) {
        } else if (acceptOneOf(singleOpSyms)) {
        } else if (accept(Sym.OperatorSequence)) {
        } else { expect(Sym.NONE); }

        return universe.symbolFor(s);
    }

    function identifier() {
        var s = text;
        var isPrimitive = accept(Sym.Primitive);
        if (!isPrimitive) {
            expect(Sym.Identifier);
        }
        return s;
    }

    function keyword() {
        var s = text;
        expect(Sym.Keyword);

        return s;
    }

    function argument() {
        return variable();
    }

    function blockContents(mgenc) {
        if (accept(Sym.Or)) {
            locals(mgenc);
            expect(Sym.Or);
        }
        return blockBody(mgenc);
    }

    function locals(mgenc) {
        while (isIdentifier(sym)) {
            mgenc.addLocalIfAbsent(variable());
        }
    }

    function blockBody(mgenc) {
        var coord = _this.getCoordinate();
        var expressions = [];

        while (true) {
            if (accept(Sym.Exit)) {
                expressions.push(result(mgenc));
                return createSequenceNode(coord, expressions);
            } else if (sym == Sym.EndBlock) {
                return createSequenceNode(coord, expressions);
            } else if (sym == Sym.EndTerm) {
                // the end of the method has been found (EndTerm) - make it implicitly
                // return "self"
                var self = variableRead(mgenc, "self", getSource(_this.getCoordinate()));
                expressions.push(self);
                return createSequenceNode(coord, expressions);
            }

            expressions.push(expression(mgenc));
            accept(Sym.Period);
        }
    }

    function createSequenceNode(coord, expressions) {
        if (expressions.length == 0) {
            return createGlobalRead("nil", universe, getSource(coord));
        } else if (expressions.length == 1) {
            return expressions[0];
        }
        return createSequence(expressions.slice(), getSource(coord));
    }

    function result(mgenc) {
        var coord = _this.getCoordinate();

        var exp = expression(mgenc);
        accept(Sym.Period);

        if (mgenc.isBlockMethod()) {
            return mgenc.getNonLocalReturn(exp, getSource(coord));
        } else {
            return exp;
        }
    }

    function expression(mgenc) {
        peekForNextSymbolFromLexer();

        if (nextSym == Sym.Assign) {
            return assignation(mgenc);
        } else {
            return evaluation(mgenc);
        }
    }

    function assignation(mgenc) {
        return assignments(mgenc);
    }

    function assignments(mgenc) {
        var coord = _this.getCoordinate();

        if (!isIdentifier(sym)) {
            throw new ParseError("Assignments should always target variables or" +
                    " fields, but found instead a %(found)s",
                Sym.Identifier, _this);
        }
        var variable = assignment();

        peekForNextSymbolFromLexer();

        var value;
        if (nextSym == Sym.Assign) {
            value = assignments(mgenc);
        } else {
            value = evaluation(mgenc);
        }

        return variableWrite(mgenc, variable, value, getSource(coord));
    }

    function assignment() {
        var v = variable();
        expect(Sym.Assign);
        return v;
    }

    function evaluation(mgenc) {
        var exp = primary(mgenc);
        if (isIdentifier(sym) || sym == Sym.Keyword
            || sym == Sym.OperatorSequence || symIn(binaryOpSyms)) {
            exp = messages(mgenc, exp);
        }
        return exp;
    }

    function primary(mgenc) {
        switch (sym) {
            case Sym.Identifier:
            case Sym.Primitive: {
                var coord = _this.getCoordinate();
                var v = variable();
                return variableRead(mgenc, v, getSource(coord));
            }
            case Sym.NewTerm: {
                return nestedTerm(mgenc);
            }
            case Sym.NewBlock: {
                var coord = _this.getCoordinate();
                var bgenc = new MethodGenerationContext(mgenc.getHolder(), mgenc);

                var blockBody = nestedBlock(bgenc);

                var blockMethod = bgenc.assemble(blockBody, lastMethodsSourceSection);
                mgenc.addEmbeddedBlockMethod(blockMethod);

                if (bgenc.requiresContext()) {
                    return new BlockNodeWithContext(blockMethod, getSource(coord));
                } else {
                    return new BlockNode(blockMethod, getSource(coord));
                }
            }
            default: {
                return literal();
            }
        }
    }

    function variable() {
        return identifier();
    }

    function messages(mgenc, receiver) {
        var msg;
        if (isIdentifier(sym)) {
            msg = unaryMessage(receiver);

            while (isIdentifier(sym)) {
                msg = unaryMessage(msg);
            }

            while (sym == Sym.OperatorSequence || symIn(binaryOpSyms)) {
                msg = binaryMessage(mgenc, msg);
            }

            if (sym == Sym.Keyword) {
                msg = keywordMessage(mgenc, msg);
            }
        } else if (sym == Sym.OperatorSequence || symIn(binaryOpSyms)) {
            msg = binaryMessage(mgenc, receiver);

            while (sym == Sym.OperatorSequence || symIn(binaryOpSyms)) {
                msg = binaryMessage(mgenc, msg);
            }

            if (sym == Sym.Keyword) {
                msg = keywordMessage(mgenc, msg);
            }
        } else {
            msg = keywordMessage(mgenc, receiver);
        }
        return msg;
    }

    function unaryMessage(receiver) {
        var coord = _this.getCoordinate();
        var selector = unarySelector();
        return createMessageSend(selector, [receiver], getSource(coord));
    }

    function binaryMessage(mgenc, receiver) {
        var coord = _this.getCoordinate();
        var msg = binarySelector();
        var operand = binaryOperand(mgenc);

        return createMessageSend(msg, [receiver, operand], getSource(coord));
    }

    function binaryOperand(mgenc) {
        var operand = primary(mgenc);

        // a binary operand can receive unaryMessages
        // Example: 2 * 3 asString
        //   is evaluated as 2 * (3 asString)
        while (isIdentifier(sym)) {
            operand = unaryMessage(operand);
        }
        return operand;
    }

    function keywordMessage(mgenc, receiver) {
        var coord = _this.getCoordinate();
        var args  = [];
        var kw    = "";

        args.push(receiver);

        do {
            kw += keyword();
            args.push(formula(mgenc));
        }
        while (sym == Sym.Keyword);

        var msg = universe.symbolFor(kw);

        return createMessageSend(msg, args.slice(), getSource(coord));
    }

    function formula(mgenc) {
        var operand = binaryOperand(mgenc);

        while (sym == Sym.OperatorSequence || symIn(binaryOpSyms)) {
            operand = binaryMessage(mgenc, operand);
        }
        return operand;
    }

    function nestedTerm(mgenc) {
        expect(Sym.NewTerm);
        var exp = expression(mgenc);
        expect(Sym.EndTerm);
        return exp;
    }

    function literal() {
        switch (sym) {
            case Sym.Pound:     return literalSymbol();
            case Sym.STString:  return literalString();
            default:            return literalNumber();
        }
    }

    function literalNumber() {
        var coord = _this.getCoordinate();

        if (sym == Sym.Minus) {
            return negativeDecimal(coord);
        } else {
            return literalDecimal(false, coord);
        }
    }

    function literalDecimal(isNegative, coord) {
        if (sym == Sym.Integer) {
            return literalInteger(isNegative, coord);
        } else {
            return literalDouble(isNegative, coord);
        }
    }

    function negativeDecimal(coord) {
        expect(Sym.Minus);
        return literalDecimal(true, coord);
    }

    function literalInteger(isNegative, coord) {
        var i = parseInt(text, 10);
        if (i == NaN) {
            throw new ParseError("Could not parse integer. Expected a number " +
                "but got '" + text + "'", Sym.NONE, _this);
        }

        if (isNegative) {
            i = 0 - i;
        }
        expect(Sym.Integer);

        var source = getSource(coord);
        if (i < -2147483647 || i > 2147483647) { // TODO: PUT CONSTANTS SOMEWHERE, move check into function
            return new BigIntegerLiteralNode(bigInt(i), source);
        } else {
            return new IntegerLiteralNode(i, source);
        }
    }

    function literalDouble(isNegative, coord) {
        var d = parseFloat(text);
        if (d === NaN) {
            throw new ParseError("Could not parse double. Expected a number " +
                "but got '" + text + "'", Sym.NONE, _this);
        }

        if (isNegative) {
            d = 0.0 - d;
        }
        expect(Sym.Double);
        var source = getSource(coord);
        return new DoubleLiteralNode(d, source);
    }

    function literalSymbol() {
        var coord = _this.getCoordinate();

        var symb;
        expect(Sym.Pound);
        if (sym == Sym.STString) {
            var s = string();
            symb = universe.symbolFor(s);
        } else {
            symb = selector();
        }

        return new SymbolLiteralNode(symb, getSource(coord));
    }

    function literalString() {
        var coord = _this.getCoordinate();
        var s = string();
        return new StringLiteralNode(s, getSource(coord));
    }

    function selector() {
        if (sym == Sym.OperatorSequence || symIn(singleOpSyms)) {
            return binarySelector();
        } else if (sym == Sym.Keyword || sym == Sym.KeywordSequence) {
            return keywordSelector();
        } else {
            return unarySelector();
        }
    }

    function keywordSelector() {
        var s = text;
        expectOneOf(keywordSelectorSyms);
        return universe.symbolFor(s);
    }

    function string() {
        var s = text;
        expect(Sym.STString);
        return s;
    }

    function nestedBlock(mgenc) {
        expect(Sym.NewBlock);
        var coord = _this.getCoordinate();

        mgenc.addArgumentIfAbsent("$blockSelf");

        if (sym == Sym.Colon) {
            blockPattern(mgenc);
        }

        // generate Block signature
        var blockSig = "$blockMethod@" + lexer.getCurrentLineNumber() + "@" + lexer.getCurrentColumn();
        var argSize = mgenc.getNumberOfArguments();
        for (var i = 1; i < argSize; i++) {
            blockSig += ":";
        }

        mgenc.setSignature(universe.symbolFor(blockSig));

        var expressions = blockContents(mgenc);

        lastMethodsSourceSection = getSource(coord);

        expect(Sym.EndBlock);

        return expressions;
    }

    function blockPattern(mgenc) {
        blockArguments(mgenc);
        expect(Sym.Or);
    }

    function blockArguments(mgenc) {
        do {
            expect(Sym.Colon);
            mgenc.addArgumentIfAbsent(argument());
        }
        while (sym == Sym.Colon);
    }

    function variableRead(mgenc, variableName, source) {
        // we need to handle super special here
        if ("super" == variableName) {
            return mgenc.getSuperReadNode(source);
        }

        // now look up first local variables, or method arguments
        var variable = mgenc.getVariable(variableName);
        if (variable != null) {
            return mgenc.getLocalReadNode(variableName, source);
        }

        // then object fields
        var varName = universe.symbolFor(variableName);
        var fieldRead = mgenc.getObjectFieldRead(varName, source);

        if (fieldRead != null) {
            return fieldRead;
        }

        // and finally assume it is a global
        return mgenc.getGlobalRead(varName, universe, source);
    }

    function variableWrite(mgenc, variableName, exp, source) {
        var variable = mgenc.getLocal(variableName);
        if (variable != null) {
            return mgenc.getLocalWriteNode(variableName, exp, source);
        }

        var fieldName = universe.symbolFor(variableName);
        var fieldWrite = mgenc.getObjectFieldWrite(fieldName, exp, universe, source);

        if (fieldWrite != null) {
            return fieldWrite;
        } else {
            throw new RuntimeException("Neither a variable nor a field found "
                + "in current scope that is named " + variableName
                + ". Arguments are read-only.");
        }
    }

    function getSymbolFromLexer() {
        sym  = lexer.getSym();
        text = lexer.getText();
    }

    function peekForNextSymbolFromLexer() {
        nextSym = lexer.peek();
    }

    // init...
    getSymbolFromLexer();
}
