var express = require("express"),
    sockets = require("socket.io"),
    debug = require("debug"),
    log = debug("apper");

var fs = require("fs"),
    http = require("http");

// module's export is a function,
// that when called creates and returns a new app
// `var apper = require("apper"),
//      app = apper();`
//  just like connect and express
exports = module.exports = function (rootDir) {
    rootDir = rootDir || process.cwd();
    log("Root directory: " + rootDir);
    return new App(rootDir);
};

// you can also create a new app using:
// `new apper.App()`
exports.App = App;

// current version
exports.version = "0.0.2";

// new App() created for a certain directory path
function App(path, indent, mountPath) {
    // new customizable settings for each App instance
    this.settings = getAppSettings();

    // if no path sent in to init, nor to App constructor,
    // then take the process's working directory as apper root
    this.path = path || process.cwd();

    this.mountPath = mountPath || "";

    // indent starts at 0 to demarcate subapps with increasing indent
    this.indent = indent || 1;
}

App.prototype.log = function () {
    var args = [].slice.call(arguments);
    var indentText = new Array(this.indent).join("- ");
    log.call(null, [indentText].concat(args).join(" "));
};

// calling init does the following:
// * load the environment and middleware modules
// * init nested app directories and mount them as subapps of the current app
// * load the routes module to register app's routes
App.prototype.init = function (opts) {

    var log = this.log = this.log.bind(this),
        mountPath = this.mountPath;

    // get respective module paths in the current app directory
    var envModulePath = this.getModulePath("environment"),
        middlewarePath = this.getModulePath("middleware"),
        routesModulePath = this.getModulePath("routes"),
        hasPublicFolder = fs.existsSync(this.path + "/public");

    if (!(envModulePath || middlewarePath || routesModulePath || hasPublicFolder)) {
        // if neither of these modules exists in the current directory,
        // then it's probably not meant to be a sub-app
        return false;
    }

    // if this really is a proper app, then load an express app here
    this.expressApp = express();

    var socketServer = this.socketServer = http.createServer(this.expressApp),
        io = sockets.listen(this.socketServer);

    io.configure(function () {
        io.enable("log");
    });

    // so that app.use(express.bodyParser()) etc
    // become app.use(app.express.bodyParser())
    this.expressApp.express = express;
    this.expressApp.socketIO = io.of(mountPath);
    this.expressApp.log = debug(mountPath);

    log(mountPath || "/");
    this.indent += 1;

    // if environment and middleware exist, load them
    if (envModulePath) {
        this.loadModule(envModulePath);
        log("Loaded environment.");
    }
    if (middlewarePath) {
        this.loadModule(middlewarePath);
        log("Loaded middleware.");
    }

    // if a /public directory exists for current app, expose it
    if (hasPublicFolder) {
        this.expressApp.use("/", express.static(this.path + "/public"));
        log("Exposed /public.");
    }

    var i;
    var subappNames = this.subappNames();
    // start a new app for all subapps and mount them under the current one
    for (i = 0; i < subappNames.length; i++) {
        var name = subappNames[i];
        var subapp = new App(this.path + "/" + name, this.indent, mountPath + "/" + name);

        // if the subapp's initialization was successful,
        if (subapp.init()) {
            // mount it as a subapp of the parent app
            this.expressApp.use("/" + name, subapp.expressApp);
        }
    }

    // load the routes last,
    // because they should only be matched if nothing else did.
    // hence it's possible to have catch-all routes.
    if (routesModulePath) {
        this.loadModule(routesModulePath);
        log("Loaded routes.");
    }

    return true;
};

App.prototype.subappNames = function () {
    // directories to ignore can be custom for each instance of App
    var dirToIgnore = this.settings.dirToIgnore,
        path = this.path,
        subapps = [],
        log = this.log;

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

App.prototype.loadModule = function (modulePath) {
    var log = this.log;

    var loadedModule;
    try {
        loadedModule = require(modulePath);
    } catch (e) {
        log(["Error loading module:", modulePath, e.message].join("\n"));
    }
    if (typeof loadedModule === "function") {
        // the module to be loaded needs to be a function
        loadedModule.call(this.expressApp, this.expressApp, this.mountPath);
    }
    return this;
};

App.prototype.getModulePath = function (type) {
    // from the list of possible module names
    var moduleNames = this.settings.moduleNames,
        moduleNamesForType = moduleNames[type],
        path = this.path,
        modulePath,
        i;

    if (moduleNamesForType) {
        for (i = 0; i < moduleNamesForType.length; i++) {
            modulePath = path + "/" + moduleNamesForType[i];
            if (fs.existsSync(modulePath)) {
                // return the first one that exists
                return modulePath;
            }
        }
    }
    return null;
};

App.prototype.start = function () {
    var callback = arguments[arguments.length - 1],
        log = this.log;
    if (typeof callback !== "function") {
        // create a callback, notifying port,
        // if one is not already present
        callback = function () {
            log("Serving on " + this.address().port);
        };
    }
    // and start listening on the express app
    var server = this.socketServer || this.expressApp;
    server.listen.apply(server, arguments);
    return this;
};


function getAppSettings() {
    // these app settings are generated per subapp,
    // and as such, can be modified for each subapp
    return {
        // directories that are never taken as a subapp
        dirToIgnore: [
            "public",
            "private",
            "lib",
            "test"
        ],
        // possible module names for
        moduleNames: {
            // environment settings
            "environment": [
                "env",
                "env.js",
                "environment",
                "environment.js"
            ],
            // middleware subscriptions
            "middleware": [
                "middleware",
                "middleware.js",
                "middlewares",
                "middlewares.js"
            ],
            // and registering routes
            "routes": [
                "routes",
                "routes.js",
                "routing",
                "routing.js"
            ]
        }
    };
}
