var appLogs = require("./app-logs");

module.exports = log;

var logging = true;
function log() {
    if (logging) {
        var args = [].slice.call(arguments);
            
        this.consoleLogger.apply(null, args);
        appLogs.push([this.mountPath].concat(args));
    }
}

log.off = function () {
    logging = false;
};

log.on = function () {
    logging = true;
};
