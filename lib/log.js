var logging = true;

function log(data) {
    if (logging) {
        this.consoleLogger(data);
    }
    this.appLog({
        mountPath: this.mountPath,
        data: data
    });
}

log.off = function () {
    logging = false;
};

log.on = function () {
    logging = true;
};

module.exports = log;
