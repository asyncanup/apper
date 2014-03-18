var path = require("path"),
    fs = require("fs");

var fsUtils = require("../fs-utils");

module.exports = function () {
    // get respective module paths in the current app directory
    this.envModulePath = fsUtils.getModulePath(this, "environment");
    this.middlewarePath = fsUtils.getModulePath(this, "middleware");
    this.routesModulePath = fsUtils.getModulePath(this, "routes");
    this.socketsModulePath = fsUtils.getModulePath(this, "sockets");
    
    this.staticContentPath = path.join(this.path, this.staticContentName);
    this.hasStaticContent = fs.existsSync(this.staticContentPath);
    
    if (!(this.envModulePath ||
            this.middlewarePath ||
            this.routesModulePath ||
            this.socketsModulePath ||
            this.hasStaticContent ||
            this.hasApperConfig)) {
        // if neither of these modules exists in the current directory,
        // then it's probably not meant to be a sub-app
        return false;
    }
};
