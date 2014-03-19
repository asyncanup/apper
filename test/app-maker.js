var path = require("path");

module.exports = function () {
    var app = require("../")({
        path: path.join(__dirname, "sample")
    });
    
    app.log.off();
    app.init();
    
    return app;
};
