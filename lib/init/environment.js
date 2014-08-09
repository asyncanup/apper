// # Load Environment
module.exports = function () {
    if (this.envModulePath && fsUtils.loadModule(this, this.envModulePath)) {
        this.log("Loaded environment.");
    }
};

var fsUtils = require("../fs-utils");