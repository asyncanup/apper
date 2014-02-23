var fs = require("fs"),
    path = require("path"),
    debug = require("debug");

var fsUtils = require("../fs-utils"),
    App = require("../app"),
    initServer = require("./server");

module.exports = function () {

// calling init does the following:
// * load the environment and middleware modules
// * init nested app directories and mount them as subapps of the current app
// * load the routes module to register app's routes

    var log = this.log = this.log.bind(this),
        mountPath = this.mountPath;

    this.logger = debug("apper:" + this.mountPath);
    
    // get respective module paths in the current app directory
    var envModulePath = fsUtils.getModulePath(this, "environment"),
        middlewarePath = fsUtils.getModulePath(this, "middleware"),
        routesModulePath = fsUtils.getModulePath(this, "routes");
    
    var staticContentPath = path.join(this.path, this.staticContentPath),
        hasStaticContent = fs.existsSync(staticContentPath);

    if (!(envModulePath || middlewarePath || routesModulePath || hasStaticContent)) {
        // if neither of these modules exists in the current directory,
        // then it's probably not meant to be a sub-app
        return false;
    }
    
    initServer.call(this);
    var express = this.expressApp.express;
    
    this.indent += 1;
    
    // if environment and middleware exist, load them
    if (envModulePath && fsUtils.loadModule(this, envModulePath)) {
        log("Loaded environment.");
    }
    if (middlewarePath && fsUtils.loadModule(this, middlewarePath)) {
        log("Loaded middleware.");
    }
    
    var i;
    var subappNames = fsUtils.subappNames(this);
    // start a new app for all subapps and mount them under the current one
    for (i = 0; i < subappNames.length; i++) {
        var name = subappNames[i];
        var subapp = new App({
            path: path.join(this.path, name),
            indent: this.indent,
            mountPath: path.join(mountPath, name),
            socketIO: this.socketIO
        });

        // if the subapp's initialization was successful,
        if (subapp.init()) {
            // mount it as a subapp of the parent app
            this.expressApp.use("/" + name, subapp.expressApp);
        }
    }

    // load the routes last,
    // because they should only be matched if nothing else did.
    // hence it's possible to have catch-all routes.
    if (routesModulePath && fsUtils.loadModule(this, routesModulePath)) {
        log("Loaded routes.");
    }
    
    // if a static content directory exists for current app, expose it
    if (hasStaticContent) {
        this.expressApp.use("/", express.static(staticContentPath));
        log("Exposed " + staticContentPath);
    }
    
    return true;
};