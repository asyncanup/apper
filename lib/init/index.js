// # Initialization
// Fails if any module returns `false` during setup.
module.exports = function () {
    var success = [
        "./get-module-paths",
        "./server",
        "./sockets",
        "./logging",
        "./environment",
        // "./plugins",
        "./middleware",
        "./sub-apps",
        "./routes",
        "./bundling",
        "./static-content"
    ].every(function (methodName) {
        return require(methodName).call(this) !== false;
    }, this);

    return success;
};