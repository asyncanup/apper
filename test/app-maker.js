var path = require("path"),
    _ = require("underscore");

module.exports = function () {
    var app = require("../")({
        path: path.join(__dirname, "sample"),
        port: 8000 + _.uniqueId()
    });
    
    app.log.disable();
    
    return app;
};
