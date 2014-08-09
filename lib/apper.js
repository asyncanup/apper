// # Apper module
// Just pass in the options for creating a new app

function apper(opts) {
    return new apper.App(opts);
}

apper.App = require("./app");
module.exports = apper;