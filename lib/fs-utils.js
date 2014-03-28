var fs = require("fs"),
    path = require("path");

var _ = require("underscore"),
    requirejs = require("requirejs");

exports.subAppNames = function (app) {
    // directories to ignore can be custom for each instance of App
    var dirToIgnore = app.dirToIgnore.concat(app.staticContentName),
        appPath = app.path,
        subapps = [],
        log = app.log;

    var files;
    try {
        // read the list of files in path
        files = fs.readdirSync(appPath);
    } catch (e) {
        log("Error reading directory:", appPath, e.message);
    }
    if (files) {
        files
            // filter them based on ignored list,
            // and remove hidden files/folders as well
            .filter(function (fileName) {
                return dirToIgnore.indexOf(fileName) === -1 && fileName[0] !== ".";
            })
            // and for the rest,
            .forEach(function (fileName) {
                var filePath = path.join(appPath, fileName);
                var fileStats;
                try {
                    // get their filesystem stats
                    fileStats = fs.statSync(filePath);
                } catch (e) {
                    log("Error reading file stats for:", filePath, e.message);
                }
                if (fileStats && fileStats.isDirectory()) {
                    // and take the remaining directories as subapps
                    subapps.push(fileName);
                }
            });
    }
    return subapps;
};

exports.getModulePath = function (app, type) {
    if (!app.moduleNames[type]) {
        throw new Error("No moduleName for module type: " + type);
    }
    var modulePath = path.join(app.path, app.moduleNames[type]);
    
    if (fs.existsSync(modulePath + ".js") || fs.existsSync(modulePath)) {
        // return the first one that exists
        return modulePath;
    }
    return null;
};

exports.loadModule = function (app, modulePath) {
    var log = app.log;

    var loadedModule;
    try {
        loadedModule = require(modulePath);
    } catch (e) {
        log(["Error loading module:", modulePath, e.stack].join("\n"));
    }
    if (typeof loadedModule === "function") {
        // the module to be loaded needs to be a function
        loadedModule.call(app.expressApp, app.expressApp);
        return true;
    }
    return false;
};


var loadedCache = {},
    excludeFromCache = {};

exports.loadIndexFile = function (app, callback) {
    var indexFilePath = path.join(app.staticContentPath, "index.html");
    
    if (loadedCache[indexFilePath]) {
        callback(null, loadedCache[indexFilePath]);
        return;
    }

    if (excludeFromCache[indexFilePath]) {
        callback(excludeFromCache[indexFilePath]);
        return;
    }
    
    app.log("Request for index file at: " + indexFilePath);
    fs.readFile(indexFilePath, function (err, data) {
        if (err) {
            app.log("Couldn't read index file at: " + indexFilePath);
            excludeFromCache[indexFilePath] = err;
            callback(err);
            return;
        }

        var code = {
            html: data.toString()
        };

        var scriptRegExp = /<script[^>]*src="([^"]+)"[^>]*><\/script>/gm,
            requireRegExp = /<script[^>]*data\-main="([^"]+)"[^>]*><\/script>/gm,
            styleRegExp = /<link[^>]*rel="stylesheet"[^>]*\bhref="([^"]+)"[^>]*>/gm;

        var scriptElements = getElements(code.html, scriptRegExp),
            requireElements = getElements(code.html, requireRegExp),
            styleElements = getElements(code.html, styleRegExp),
            totalFiles = scriptElements.length + requireElements.length + styleElements.length;

        var partDone = _.after(totalFiles, done),
            log = app.log.bind(app);

        requireElements.forEach(optimize(app.staticContentPath, code, partDone, log));
        styleElements.forEach(replaceWith("style", "href", app.staticContentPath, code, partDone, log));
        scriptElements.forEach(replaceWith("script", "src", app.staticContentPath, code, partDone, log));

        function done() {
            app.log("Setting cache for index file:" + indexFilePath);
            loadedCache[indexFilePath] = code.html;
            callback(null, loadedCache[indexFilePath]);
        }
    });
};

function getElements(html, regExp) {
    var elements = [],
        match = regExp.exec(html);

    while (match) {
        elements.push({
            tag: match[0],
            path: match[1]
        });
        match = regExp.exec(html);
    }

    return elements;
}

function optimize(staticContentPath, code, callback, log) {
    log = log || console.log;

    return function (resource) {
        var resourcePath = resource.path,
            resourceTag = resource.tag,
            startTag = "<script data-requirejs=\"" + resourcePath + "\">\n",
            endTag = "</script>",
            newTag = startTag.trim() + endTag;

        var resourceFilePath = path.join(staticContentPath, resourcePath + ".js"),
            cacheContents = loadedCache[resourceFilePath];
        
        code.html = code.html
            .split(resourceTag)
            .join(resourceTag + newTag);
        resourceTag = newTag;

        if (cacheContents) {
            code.html = code.html
                .split(resourceTag)
                .join(startTag + cacheContents + endTag);
            callback();
            return;
        }

        var parts = resourcePath.split("/"),
            mainFile = parts.pop(),
            baseUrl = path.join(staticContentPath, parts.join("/")),
            outFile = path.join(staticContentPath, _.uniqueId("require-build-") + ".rjs");
        
        log("Optimizing: " + resourceFilePath);
        
        var requireConfig = {};
        try {
            requireConfig = require(path.join(baseUrl, "require-config"));
        } catch (e) {
            log("No require-config found");
        }
        
        requirejs.optimize(
            _.extend(
                {
                    baseUrl: baseUrl,
                    name: mainFile,
                    out: outFile,
                    optimize: "none"
                },
                requireConfig
            ),
            function () {
                fs.readFile(outFile, function (err, builtContents) {
                    if (err) {
                        log("Couldn't read created build file: " + outFile);
                        callback();
                        return;
                    }
                    
                    fs.unlink(outFile, function (err) {
                        if (err) {
                            log("Could not delete built file: " + outFile);
                            log(err.message);
                            return;
                        }
                    });

                    builtContents = builtContents.toString();
                    loadedCache[resourceFilePath] = builtContents;
                    
                    code.html = code.html
                        .split(resourceTag)
                        .join(startTag + builtContents + endTag);
                    callback();
                }
            );
        }, function (err) {
            log("Could not optimize: " + resourceFilePath);
            log(err.message);
            callback();
        });
    };
}

function replaceWith(tagName, pathAttribute, staticContentPath, code, callback, log) {
    log = log || console.log;
    
    return function (resource) {
        var resourcePath = resource.path,
            resourceTag = resource.tag,
            startTag = "<" + tagName +
                " data-" + pathAttribute + "=\"" + resourcePath + "\">\n",
            endTag = "</" + tagName + ">";

        if (/^\//.test(resourcePath) || /^http/.test(resourcePath)) {
            log("URL is not relative: " + resourcePath);
            callback();
            return;
        }
        
        var resourceFilePath = path.join(staticContentPath, resourcePath),
            cacheContents = loadedCache[resourceFilePath];
        
        if (cacheContents) {
            code.html = code.html
                .split(resourceTag)
                .join(startTag + cacheContents + endTag);
            callback();
            return;
        }

        fs.readFile(resourceFilePath, function (err, contents) {
            if (err) {
                log("Couldn't read resource file at: " + resourceFilePath);
                callback();
                return;
            }
            
            contents = contents.toString();
            
            log("Setting cache for resource file: " + resourceFilePath);
            loadedCache[resourceFilePath] = contents;
            code.html = code.html
                .split(resourceTag)
                .join(startTag + contents + endTag);
            callback();
        });
    };
}
