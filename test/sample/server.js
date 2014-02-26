var app = require("../../")({
    path: __dirname
});
app.init() && app.start(7999);

module.exports = app;