var fsUtils = require("../fs-utils");

module.exports = function () {
    // if environment and middleware exist, load them
    if (this.envModulePath && fsUtils.loadModule(this, this.envModulePath)) {
        this.log("Loaded environment.");
    }
    if (this.middlewarePath && fsUtils.loadModule(this, this.middlewarePath)) {
        this.log("Loaded middleware.");
    }
};
