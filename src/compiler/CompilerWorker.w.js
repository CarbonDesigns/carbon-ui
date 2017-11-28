importScripts(['/target/typescript.js']);

var files = {};

var options = {
    target: 1,
    module: 5,
    noLib: true,
    inlineSourceMap:true,
    inlineSources:true,
    allowJs: false,
    noEmitOnError: true,
    allowNonTsExtensions: true,
    noImplicitAny: true,
    noImplicitThis: true,
    noImplicitReturns: true,
    removeComments: true,
    strictNullChecks: true,
    alwaysStrict: true,
};

// Create the language service host to allow the LS to communicate with the host
var servicesHost = {
    getScriptFileNames: function () { return Object.keys(files) },
    getScriptVersion: function (fileName) { return files[fileName] && files[fileName].version.toString() },
    getScriptSnapshot: function (fileName) {
        if (!files[fileName]) {
            return undefined;
        }

        return ts.ScriptSnapshot.fromString(files[fileName].text);
    },
    getCurrentDirectory: function () { return "." },
    getCompilationSettings: function () { return options },
    getDefaultLibFileName: function (options) { return "lib.d.ts"; },
    fileExists: function (fileName) {
        return !!files[fileName];
    },
    readFile: function (fileName) {
        return files[fileName].text;
    }
};

// Create the language service files
var services = ts.createLanguageService(servicesHost, ts.createDocumentRegistry())

addEventListener('message', function (e) {
    let fileName = e.data.fileName;
    if (fileName && e.data.text) {
        let version = 0;
        if (files[fileName]) {
            version = files[fileName].version || 0;
        }
        files[fileName] = { text: e.data.text, version: version + 1 };
        if (!fileName.endsWith('.d.ts')) {
            emitFile(e.data.fileName);
        }
    }
});

function emitFile(fileName) {
    var output = services.getEmitOutput(fileName);

    if (output.emitSkipped) {
        logErrors(fileName);
    }

    output.outputFiles.forEach(function (o) {
        postMessage({ fileName: fileName, resultFileName: o.name, error: false, text: o.text });
    });
}

function logErrors(fileName) {
    var allDiagnostics = services.getCompilerOptionsDiagnostics()
        .concat(services.getSyntacticDiagnostics(fileName))
        .concat(services.getSemanticDiagnostics(fileName));

    var errors = [];
    allDiagnostics.forEach(function (diagnostic) {
        var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
        if (diagnostic.file) {
            var res = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);

            errors.push({ fileName: diagnostic.file.fileName, line: res.line + 1, character: res.character + 1, message: message });
        }
        else {
            errors.push({ message: message });
        }
    });

    postMessage({ error: true, fileName: fileName, errors: errors })
}