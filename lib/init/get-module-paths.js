// # Get Module Paths
// Get module paths for server modules like `environment`, `routes`, etc.

module.exports = function () {
    var getPath = getModulePath.bind(this);
    
    // Set static content and server module paths for the application
    this.staticContentPath = path.join(this.path, this.staticContentName);
    this.hasStaticContent = fs.existsSync(this.staticContentPath);
    
    this.envModulePath = getPath("environment");
    this.middlewarePath = getPath("middleware");
    this.routesModulePath = getPath("routes");
    this.socketsModulePath = getPath("sockets");
    
    // If no such paths exist for the current application, then initialization
    // of this app can be stopped since this folder does not contain an application
    if (!(this.envModulePath ||
            this.middlewarePath ||
            this.routesModulePath ||
            this.socketsModulePath ||
            this.hasStaticContent ||
            this.hasApperConfig)) {
        return false;
    }
};

// To get a server module's path, check in the app's path for the relevant file
function getModulePath(type) {
    if (!this.moduleNames[type]) {
        throw new Error("No moduleName for module type: " + type);
    }
    var modulePath = path.join(this.path, this.moduleNames[type]);
    
    if (fs.existsSync(modulePath + ".js") || fs.existsSync(modulePath)) {
        return modulePath;
    }
    return null;
}

var path = require("path"),
    fs = require("fs");