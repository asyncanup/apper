(function () {
    "use strict";

    var express = require("express"),
        methods = require("methods"),
        fs      = require("fs");

    var log = console.log;

    var defaultModules = [
            "environment",
            "middlewares",
            "routes"
        ],
        dirToIgnore = [
            "public",
            "private",
            "lib",
            "test"
        ];

    var expressApp = express(),
        appRoutes = [];

    var moduleContext = {
        "environment": {
            set: function () {
                expressApp.set.apply(expressApp, arguments);
            }
        },
        "middlewares": function (mountPathForApp) {
            return {
                use: function (middleware) {
                    var mountPathForMiddleware = mountPathForApp;
                    if (typeof middleware === "string") {
                        mountPathForMiddleware = middleware;
                        middleware = arguments[1];
                    }
                    if (typeof middleware === "function") {
                        expressApp.use.call(expressApp, mountPathForMiddleware, middleware);
                    }
                }
            };
        },
        "routes": function (mountPathForApp) {
            var routesContext = {};

            methods.forEach(function (methodName) {
                if (expressApp[methodName]) {
                    routesContext[methodName] = function (routeHandler) {
                        var mountPathForRoute = mountPathForApp;

                        if (typeof routeHandler === "string") {
                            mountPathForRoute = routeHandler;
                            routeHandler = arguments[1];
                        }

                        if (typeof routeHandler === "function") {
                            appRoutes.push({
                                method: methodName,
                                mountPath: mountPathForRoute,
                                routeHandler: routeHandler
                            });
                        }
                    };
                }
            });

            return routesContext;
        }
    };

    exports.start = function (port, callback) {
        if (typeof port === "function") {
            callback = port;
            port = process.env.PORT;
        } else if (typeof callback !== "function") {
            callback = function () {
                console.log("Listening on " + this.address().port);
            };
        }

        appRoutes.forEach(function (route) {
            expressApp[route.method].apply(expressApp, route.mountPath, route.routeHandler);
        });

        expressApp.use(expressApp.router);
        expressApp.listen(port, callback);
    };

    function getDefaultModules(fullPath, mountPath) {
        var modulesPresent = [];

        defaultModules.forEach(function (moduleName) {
            try {
                var moduleFunc = require(fullPath + "/" + moduleName);
                if (typeof moduleFunc === "function") {
                    modulesPresent.push({
                        moduleFunc: moduleFunc,
                        moduleName: moduleName
                    });
                }
            } catch (e) {}
        });

        return modulesPresent;
    }

    function loadDefaultModules(modulesPresent, mountPath) {
        modulesPresent.forEach(function (m) {
            log("Loading " + mountPath + "/" + m.moduleName);
            m.moduleFunc(moduleContext[m.moduleName], mountPath);
        });
    }

    function initPath(fullPath, mountPath) {
        log("initPath: " + fullPath);
        log("mountPath: " + mountPath);
        debugger;
        mountPath = mountPath || "";
        if (fullPath.indexOf(".") === 0) {
            fullPath = process.cwd() + "/" + fullPath;
        }

        var modulesPresent = getDefaultModules(fullPath, mountPath);

        if (modulesPresent.length > 0) {
            loadDefaultModules(modulesPresent, mountPath);

            expressApp.use(mountPath + "/public", express.static(fullPath + "/public"));
            log("Exposed " + mountPath + "/public");

            fs.readdir(fullPath, function (err, files) {
                debugger;
                if (err) {
                    console.log("Couldn't init path: " + fullPath);
                } else {
                    files
                        .filter(function (fileName) {
                            return dirToIgnore.indexOf(fileName) === -1;
                        })
                        .forEach(function (fileName) {
                            var filePath = fullPath + "/" + fileName;
                            fs.stat(filePath, function (err, fileStats) {
                                debugger;
                                if (err) {
                                    console.log("Error reading file: " + filePath);
                                } else {
                                    if (fileStats.isDirectory()) {
                                        initPath(filePath, mountPath + "/" + fileName, true);
                                    }
                                }
                            });
                        });
                }
            });
        } else {
            log("No default modules in " + mountPath + ". Skipping directory.");
        }
    }

    exports.init = initPath;
}());
