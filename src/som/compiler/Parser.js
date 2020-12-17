/*
* Copyright (c) 2014 Stefan Marr, mail@stefan-marr.de
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/
const RuntimeException = require('../../lib/exceptions').RuntimeException;

const Lexer = require('./Lexer').Lexer;
const Sym = require('./Symbol').Sym;
const MethodGenerationContext = require('./MethodGenerationContext').MethodGenerationContext;
const SourceSection = require('./SourceSection').SourceSection;

const factory = require('../interpreter/NodeFactory');

const u = require('../vm/Universe');

const isInIntRange = require('../../lib/platform').isInIntRange;


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
        return Sym.toString(expected);
    };

    this.toString = function () {
        var msg = "%(file)s:%(line)d:%(column)d: error: " + message;
        var foundStr;
        if (printableSymbol(found)) {
            foundStr = Sym.toString(found) + " (" + text + ")";
        } else {
            foundStr = Sym.toString(found);
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
    };

    this.toString = function () {
        return "Parser(" + source.getName() + ", "
            + _this.getCoordinate().toString() + ")";
    };

    this.getCoordinate = function () {
        return lexer.getStartCoordinate();
    };

    this.classdef = function (cgenc) {
        cgenc.setName(u.universe.symbolFor(text));
        expect(Sym.Identifier);
        expect(Sym.Equal);

        superclass(cgenc);

        expect(Sym.NewTerm);
        instanceFields(cgenc);

        while (isIdentifier(sym) || sym == Sym.Keyword
            || sym == Sym.OperatorSequence || symIn(binaryOpSyms)) {
            var mgenc = new MethodGenerationContext(cgenc, null, false);
            var methodBody = method(mgenc);
            cgenc.addInstanceMethod(
                mgenc.assemble(methodBody, lastMethodsSourceSection));
        }

        if (accept(Sym.Separator)) {
            cgenc.setClassSide(true);
            classFields(cgenc);
            while (isIdentifier(sym) || sym == Sym.Keyword
                || sym == Sym.OperatorSequence || symIn(binaryOpSyms)) {
                var mgenc = new MethodGenerationContext(cgenc, null, false);
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
            superName = u.universe.symbolFor(text);
            accept(Sym.Identifier);
        } else {
            superName = u.universe.symbolFor("Object");
        }
        cgenc.setSuperName(superName);

        // Load the super class, if it is not nil (break the dependency cycle)
        if (superName.getString() != "nil") {
            var superClass = u.universe.loadClass(superName);
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
                cgenc.addInstanceField(u.universe.symbolFor(v));
            }
            expect(Sym.Or);
        }
    }

    function classFields(cgenc) {
        if (accept(Sym.Or)) {
            while (isIdentifier(sym)) {
                var v = variable();
                cgenc.addClassField(u.universe.symbolFor(v));
            }
            expect(Sym.Or);
        }
    }

    function getSource(coord) {
        return new SourceSection('method', coord.startLine, coord.startColumn,
            coord.charIndex, lexer.getNumberOfCharactersRead() - coord.charIndex);
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

        mgenc.setSignature(u.universe.symbolFor(kw.toString()));
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
        return u.universe.symbolFor(identifier());
    }

    function binarySelector() {
        var s = text;

        if (accept(Sym.Or)) {
        } else if (accept(Sym.Comma)) {
        } else if (accept(Sym.Minus)) {
        } else if (accept(Sym.Equal)) {
        } else if (acceptOneOf(singleOpSyms)) {
        } else if (accept(Sym.OperatorSequence)) {
        } else { expect(Sym.NONE); }

        return u.universe.symbolFor(s);
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
            return factory.createGlobalRead(u.universe.symbolFor("nil"), getSource(coord));
        } else if (expressions.length == 1) {
            return expressions[0];
        }
        return factory.createSequence(expressions.slice(), getSource(coord));
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
                var bgenc = new MethodGenerationContext(mgenc.getHolder(), mgenc, true);

                var blockBody = nestedBlock(bgenc);

                var blockMethod = bgenc.assemble(blockBody, lastMethodsSourceSection);

                return factory.createBlockNode(blockMethod, getSource(coord));
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
        return factory.createMessageSend(selector, [receiver], getSource(coord));
    }

    function binaryMessage(mgenc, receiver) {
        var coord = _this.getCoordinate();
        var msg = binarySelector();
        var operand = binaryOperand(mgenc);

        return factory.createMessageSend(msg, [receiver, operand], getSource(coord));
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

        var msg = u.universe.symbolFor(kw);

        return factory.createMessageSend(msg, args.slice(), getSource(coord));
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

    function getObjectForCurrentLiteral(coord) {
        switch (sym) {
            case Sym.Pound: {
                peekForNextSymbolFromLexerIfNecessary();
                if (nextSym == Sym.NewTerm) {
                    return literalArray();
                } else {
                    return literalSymbol();
                }
            }
            case Sym.STString:
                return literalString();
            default:
                return literalNumber();
        }
    }

    function literal() {
        const coord = _this.getCoordinate();
        const value = getObjectForCurrentLiteral(coord);
        const source = getSource(coord);
        return factory.createLiteralNode(value, source);
    }

    function literalNumber() {
        if (sym == Sym.Minus) {
            return negativeDecimal();
        } else {
            return literalDecimal(false);
        }
    }

    function literalDecimal(isNegative) {
        if (sym == Sym.Integer) {
            return literalInteger(isNegative);
        } else {
            return literalDouble(isNegative);
        }
    }

    function negativeDecimal() {
        expect(Sym.Minus);
        return literalDecimal(true);
    }

    function isNegativeNumber() {
        var isNegative  = false;
        if (sym === Sym.Minus) {
            expect(Sym.Minus);
            _this.isNegative = true;
        }
        return isNegative;
    }

    function literalInteger(isNegative) {
        var i = parseInt(text, 10);
        if (isNaN(i)) {
            throw new ParseError("Could not parse integer. Expected a number " +
                "but got '" + text + "'", Sym.NONE, _this);
        }

        if (isNegative) {
            i = 0 - i;
        }
        expect(Sym.Integer);

        if (isInIntRange(i)) {
            return u.universe.newInteger(i);
        } else {
            return u.universe.newBigInteger(BigInt(i));
        }
    }

    function literalDouble(isNegative) {
        var d = parseFloat(text);
        if (isNaN(d)) {
            throw new ParseError("Could not parse double. Expected a number " +
                "but got '" + text + "'", Sym.NONE, _this);
        }

        if (isNegative) {
            d = 0.0 - d;
        }
        expect(Sym.Double);
        return u.universe.newDouble(d);
    }

    function literalSymbol() {
        expect(Sym.Pound);
        if (sym == Sym.STString) {
            var s = string();
            return u.universe.symbolFor(s);
        } else {
            return selector();
        }
    }

    function literalString() {
        var s = string();
        return u.universe.newString(s);
    }

    function literalArray() {
        const literals = [];
        expect(Sym.Pound);
        expect(Sym.NewTerm);

        while (sym != Sym.EndTerm) {
            literals.push(getObjectForCurrentLiteral());
        }

        expect(Sym.EndTerm);
        return u.universe.newArrayFrom(literals);
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
        return u.universe.symbolFor(s);
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

        mgenc.setSignature(u.universe.symbolFor(blockSig));

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
        var varName = u.universe.symbolFor(variableName);
        var fieldRead = mgenc.getObjectFieldRead(varName, source);

        if (fieldRead != null) {
            return fieldRead;
        }

        // and finally assume it is a global
        return mgenc.getGlobalRead(varName, source);
    }

    function variableWrite(mgenc, variableName, exp, source) {
        var variable = mgenc.getVariable(variableName);
        if (variable != null) {
            return mgenc.getLocalWriteNode(variableName, exp, source);
        }

        var fieldName = u.universe.symbolFor(variableName);
        var fieldWrite = mgenc.getObjectFieldWrite(fieldName, exp, source);

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

    function peekForNextSymbolFromLexerIfNecessary() {
        if (!lexer.getPeekDone()) {
            peekForNextSymbolFromLexer();
        }
    }

    // init...
    getSymbolFromLexer();
}

exports.Parser = Parser;
