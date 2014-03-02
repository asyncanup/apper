var appLogs = require("./app-logs");

module.exports = log;

var logging = true;
function log() {
    if (logging) {
        var args = [].slice.call(arguments),
            time = new Date().toUTCString();
            
        this.consoleLogger.apply(null, args);
        appLogs.push([time, this.mountPath].concat(args));
    }
}

log.off = function () {
    logging = false;
};

log.on = function () {
    logging = true;
};
