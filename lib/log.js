module.exports = log;

var logging = true;
function log() {
    if (logging) {
        this.logger.apply(null, arguments);
    }
}

log.off = function () {
    logging = false;
};

log.on = function () {
    logging = true;
};
