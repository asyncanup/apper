function log() {
    return handle(this, arguments);
}

module.exports = log;

log.print = function (data) {
    return handle(this, arguments, console.log.bind(console));
};

log.disable = function () {
    logging = false;
};

log.enable = function () {
    logging = true;
};

var logging = true;
function handle(context, args, logFunc) {
    var debug = require("debug")("apper:" + this.mountPath);
    args = [].slice.call(args);
    if (logging) {
        if (logFunc) debug.log = logFunc;
        debug.apply(null, args);
    }
    context.appLog && context.appLog({
        mountPath: context.mountPath,
        data: args
    });
    return context;
}