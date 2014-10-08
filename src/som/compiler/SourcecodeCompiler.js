function getFile(path, file) {
    var current = som.core_lib;

    path.split("/").forEach(function (e) {
        if (current == undefined) {
            return null;
        }
        current = current[e];
    });

    if (current == undefined || current[file] == undefined) {
        return null;
    } else {
        return current[file];
    }
}

function compile(parser, systemClass) {
    var cgc = new ClassGenerationContext();

    var result = systemClass;
    // try {
        parser.classdef(cgc);
    //} catch (pe) {
    //    universe.errorExit(pe.toString());
    //}

    if (systemClass == null) {
        result = cgc.assemble();
    } else {
        cgc.assembleSystemClass(result);
    }

    return result;
}

function compileClassFile(path, file, systemClass) {
    var source = getFile(path, file + ".som");
    if (source == null) {
        return null;
    }

    var result = compile(new Parser(source, path + '/' + file + '.som'), systemClass);

    var cname  = result.getName();
    var cnameC = cname.getString();

    if (file != cnameC) {
        throw new IllegalStateException("File name " + file
            + " does not match class name " + cnameC);
    }
    return result;
}

function compileClassString(stmt, systemClass) {
    return compile(new Parser(stmt, '$string'), systemClass);
}
