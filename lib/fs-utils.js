var fs = require("fs"),
    path = require("path");

var cheerio = require("cheerio"),
    _ = require("underscore"),
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

var loadedCache = {};
exports.loadIndexFile = function (app, callback) {
    var indexFilePath = path.join(app.staticContentPath, "index.html");
    
    if (loadedCache[indexFilePath]) {
        callback(null, loadedCache[indexFilePath]);
        return;
    }
    
    app.log("Request for index file at: " + indexFilePath);
    fs.readFile(indexFilePath, function (err, data) {
        if (err) {
            app.log("Couldn't read index file at: " + indexFilePath);
            callback(err);
            return;
        }
        var $ = cheerio.load(data.toString()),
            styleTags = $("link[rel=stylesheet][href]"),
            scriptTags = $("script[src]"),
            requireTags = $("script[src][data-main]");
        
        var totalFiles = styleTags.length + scriptTags.length + requireTags.length;
        var partDone = _.after(totalFiles, done);
        
        requireTags.each(optimize());
        styleTags.each(replaceWith("style", "href"));
        scriptTags.each(replaceWith("script", "src"));
        
        function done() {
            app.log("Setting cache for index file:" + indexFilePath);
            loadedCache[indexFilePath] = $.html();
            callback(null, loadedCache[indexFilePath]);
        }
        
        function optimize() {
            return function () {
                var newElement = $("<script>"),
                    requireElement = $(this).clone(),
                    relativeFilePath = requireElement.attr("data-main");
                
                $(this).after(requireElement);
                var parts = relativeFilePath.split("/"),
                    mainFile = parts.pop(),
                    baseUrl = path.join(app.staticContentPath, parts.join("/")),
                    outFile = path.join(app.staticContentPath, _.uniqueId("require-build-") + ".js");
                
                console.log("Optimizing: " + relativeFilePath);
                requirejs.optimize({
                    baseUrl: baseUrl,
                    name: mainFile,
                    out: outFile
                }, function () {
                    fs.readFile(outFile, function (err, builtContents) {
                        if (err) {
                            console.log("Couldn't read created build file: " + outFile);
                            partDone();
                            return;
                        }
                        
                        fs.unlink(outFile, function (err) {
                            if (err) {
                                console.log("Could not delete built file: " + outFile);
                                return;
                            }
                            
                            builtContents = builtContents.toString();
                            loadedCache[relativeFilePath] = builtContents;
                            
                            newElement.html(loadedCache[relativeFilePath]);
                            requireElement.replaceWith(newElement);
                            
                            partDone();
                        });
                    });
                }, function (err) {
                    console.log("errrarrgh!");
                    console.log(err.message);
                    partDone();
                });
            };
        }

        function replaceWith(tagName, pathAttribute) {
            return function () {
                var newElement = $("<" + tagName + ">"),
                    oldElement = $(this),
                    relativeFilePath = oldElement.attr(pathAttribute);
                
                if (/^\//.test(relativeFilePath) || /^http/.test(relativeFilePath)) {
                    app.log("URL is not relative: " + relativeFilePath);
                    partDone();
                    return;
                }
                
                var resourceFilePath = path.join(app.staticContentPath, relativeFilePath);
                
                if (loadedCache[resourceFilePath]) {
                    newElement.html(loadedCache[resourceFilePath]);
                    oldElement.replaceWith(newElement);
                    partDone();
                    return;
                }
                
                fs.readFile(resourceFilePath, function (err, contents) {
                    if (err) {
                        app.log("Couldn't read style file at: " + resourceFilePath);
                        partDone();
                        return;
                    }
                    
                    contents = contents.toString();
                    
                    app.log("Setting cache for resource file: " + resourceFilePath);
                    loadedCache[resourceFilePath] = contents;
                    
                    newElement.html(contents.toString());
                    oldElement.replaceWith(newElement);
                    partDone();
                });
            };
        }
    });
};
