var appLog = require("./app-log");

module.exports = log;

var logging = true;
function log(data) {
    if (logging) {
        this.consoleLogger(data);
        appLog({
            mountPath: this.mountPath,
            data: data
        });
    }
}

log.off = function () {
    logging = false;
};

log.on = function () {
    logging = true;
};
