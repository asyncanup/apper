var App = require("./lib/app");

module.exports = apper;

function apper(opts) {
    return new App(opts);
}

apper.App = App;