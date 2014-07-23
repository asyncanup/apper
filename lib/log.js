var logging = true;

function log(data) {
    try {
        if (logging) {
            this.consoleLogger(data);
        }
        this.appLog({
            mountPath: this.mountPath,
            data: data
        });
    } catch (e) {
        console.log(data);
    }
    return this;
}

log.off = function () {
    logging = false;
};

log.on = function () {
    logging = true;
};

module.exports = log;
