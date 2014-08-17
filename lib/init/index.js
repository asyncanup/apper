// # Initialization
// Fails if any module returns `false` during setup.
module.exports = function () {
    var success = [
        "./logging",
        "./get-module-paths",
        "./server",
        "./sockets",
        "./environment",
        // "./plugins",
        "./middleware",
        "./sub-apps",
        "./routes",
        "./bundling",
        "./static-content"
    ].every(function (moduleName) {
        return require(moduleName).call(this) !== false;
    }, this);

    return success;
};