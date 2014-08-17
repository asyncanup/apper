var path = require("path"),
    _ = require("underscore");

module.exports = function (opts) {
    var app = require("../")(_.extend({
        path: path.join(__dirname, "sample"),
        port: 8000 + (+_.uniqueId())
    }, opts));
    
    app.log.disable();
    
    return app;
};
