// # Logger
// Log handling can have third-party integrations
module.exports = log;
function log() {
    return handle(this, arguments);
}

// ## Custom logging extensions

// `app.log.print` logs to console, apart from regular integration
log.print = function (data) {
    return handle(this, arguments, console.log.bind(console));
};

// ## Lifecycle
// Logging can be enabled/disabled for the entire application
// It is enabled by default
var logging = true;
log.enable = function () {
    logging = true;
};
log.disable = function () {
    logging = false;
};

// ## Namespaced logging

// To see logs from the entire application, set environment variable `DEBUG` to
// value `apper:*`. Or just use the following command to run application:
// 
//      DEBUG=apper:* node server.js
// 
// To view runtime logs for a particular subapp, use:
// 
//      DEBUG=apper:/subapp* node server.js
// 
function handle(context, args, logFunc) {
    var debug = require("debug")("apper:" + this.mountPath);
    args = [].slice.call(args);
    if (logging) {
        if (logFunc) debug.log = logFunc;
        debug.apply(null, args);
    }
    
    // ## Third-party integration
    // `appLog` gets all incoming logs from both server as well as client,
    // and must be used as the central place for integration with third-party services.
    context.appLog && context.appLog({
        mountPath: context.mountPath,
        data: args
    });
    return context;
}