var fsUtils = require("../fs-utils");

module.exports = function () {
    if (this.middlewarePath && fsUtils.loadModule(this, this.middlewarePath)) {
        this.log("Loaded middleware.");
    }
};
