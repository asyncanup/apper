var fs = require("fs"),
    path = require("path"),
    _ = require("underscore");

var fsUtils = require("../fs-utils");

var pluginDir = path.join(__dirname, "..", "..", "plugins"),
    pluginNames = fs.readdirSync(pluginDir),
    jsFileExt = /\.js$/;

var plugins = {};
    
pluginNames.forEach(function (pluginFileName) {
    var pluginName = pluginFileName.replace(jsFileExt, ""),
        pluginPath = path.join(pluginDir, pluginFileName);
    
    plugins[pluginName] = require(pluginPath);
}.bind(this));

module.exports = function () {
    this.expressApp.plugins = plugins;
};
