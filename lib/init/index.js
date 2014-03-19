module.exports = function () {

    // calling init does the following:
    // * load the environment and middleware modules
    // * init nested app directories and mount them as subapps of the current app
    // * load the routes module to register app's routes
    var success = [
        "./get-module-paths",
        "./server",
        "./logging",
        "./env-middleware",
        "./sub-apps",
        "./routes-static"
    ].every(function (methodName) {
        return require(methodName).call(this) !== false;
    }, this);

    return success;
};