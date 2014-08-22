// # Bundling
// 
// Bundling transparently minifies and inlines JavaScript and CSS resources on
// first page load.
// 
// Works only if no custom route was assigned for `'/'` and `index.html` file
// is found in static content directory.
module.exports = function () {
    this.expressApp.get('/', function (req, res, next) {
        if (!this.appConfig.bundle) return next();
        
        fsUtils.loadIndexFile(this, function (err, html) {
            if (err) return next();
            res.send(html);
        });
    }.bind(this));
};

var fsUtils = require('../fs-utils');