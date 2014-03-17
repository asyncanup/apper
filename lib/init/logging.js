var debug = require("debug");

module.exports = function () {
    this.log = this.log.bind(this);
    this.consoleLogger = debug("apper:" + this.mountPath);
};
