// # Load Middleware
module.exports = function () {
    if (this.middlewarePath && fsUtils.loadModule(this, this.middlewarePath)) {
        this.log("Loaded middleware.");
    }
};

var fsUtils = require("../fs-utils");