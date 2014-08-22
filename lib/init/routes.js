// # Load Routes
module.exports = function () {
    if (this.routesModulePath && fsUtils.loadModule(this, this.routesModulePath)) {
        this.log('Loaded routes.');
    }
    
    // And expose server logs on a custom route
    this.expressApp.get('/_logs', function (req, res) {
        res.json(this.appLog.get());
    }.bind(this));
};

var fsUtils = require('../fs-utils');