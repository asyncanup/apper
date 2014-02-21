var fs = require("fs");

exports.subappNames = function (app) {
    // directories to ignore can be custom for each instance of App
    var dirToIgnore = app.dirToIgnore,
        path = app.path,
        subapps = [],
        log = app.log;

    var files;
    try {
        // read the list of files in path
        files = fs.readdirSync(path);
    } catch (e) {
        log("Error reading directory:", path, e.message);
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
                var filePath = path + "/" + fileName;
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
    var modulePath = app.path + "/" + app.moduleNames[type];
    
    if (fs.existsSync(modulePath)) {
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
        loadedModule.call(app.expressApp, app.expressApp, app.mountPath);
        return true;
    }
    return false
};

