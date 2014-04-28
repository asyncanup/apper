var fsUtils = require("../fs-utils");

module.exports = function () {
    if (this.socketsModulePath && fsUtils.loadModule(this, this.socketsModulePath)) {
        this.log("Loaded sockets.");
    }
};
