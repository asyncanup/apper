// # Apper Module
// Just pass in the options for creating a new app

module.exports = apper;

function apper(opts) {
    return new apper.App(opts);
}

apper.App = require('./app');