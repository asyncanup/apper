var fsUtils = require("../fs-utils");

module.exports = function () {
    this.expressApp.get("/", function (req, res, next) {
        if (!this.appConfig.bundle) return next();
        
        fsUtils.loadIndexFile(this, function (err, html) {
            if (err) return next();
            res.send(html);
        });
    }.bind(this));
};
