var logging = true;

function log(data, important) {
    try {
        if (logging) {
            if (important) console.log(data);
            this.consoleLogger(data);
        }
        this.appLog({
            mountPath: this.mountPath,
            data: data
        });
    } catch (e) {}
    return this;
}

log.off = function () {
    logging = false;
};

log.on = function () {
    logging = true;
};

module.exports = log;
