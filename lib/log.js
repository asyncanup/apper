var logHandler = require("debug")("apper");

module.exports = log;

var logging = true;
function log() {
    if (logging) {
        var args = [].slice.call(arguments);
        var indentText = new Array(this.indent).join("- ");
        logHandler.call(null, [indentText].concat(args).join(" "));
    }
}

log.off = function () {
    logging = false;
};

log.on = function () {
    logging = true;
};
