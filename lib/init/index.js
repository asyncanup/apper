// # Initialization
// Fails if any module returns `false` during setup.
module.exports = function () {
    this.appLog = require('../app-log')();
    
    var success = [
        './get-module-paths',
        './server',
        './sockets',
        './environment',
        './middleware',
        './sub-apps',
        './routes',
        './bundling',
        './static-content'
    ].every(function (moduleName) {
        return require(moduleName).call(this) !== false;
    }, this);

    return success;
};