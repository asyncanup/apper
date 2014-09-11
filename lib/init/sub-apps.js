// # Mount subapps
module.exports = function () {
    this.subapps = {};
    
    // Try to setup a new subapp for all folders in current directory.
    // 
    // If the subapp's initialization is successful,
    // mount it as a subapp of the parent app
    var names = subappNames(this), i;
    for (i = 0; i < names.length; i++) {
        var name = names[i];
        var subapp = new App({
            path: path.join(this.path, name),
            indent: this.indent,
            mountPath: this.mountPath + '/' + name,
            sockets: this.sockets
        });

        if (subapp.didInitialize) {
            this.expressApp.use('/' + name, subapp.expressApp);
            this.subapps[name] = subapp;
        }
    }    
};

// Potential subapps:
// 
// - should be directories
// - should not be in `app.dirToIgnore`
// - should not be hidden folders
// - 
function subappNames(app) {
    var dirToIgnore = app.dirToIgnore.concat(app.staticDir),
        subapps = []

    var files;
    try {
        files = fs.readdirSync(app.path);
    } catch (e) {
        app.log('Error reading directory:', app.path, e.message);
    }
    if (files) {
        files
            .filter(function (fileName) {
                return dirToIgnore.indexOf(fileName) === -1 && fileName[0] !== '.';
            })
            .forEach(function (fileName) {
                var filePath = path.join(app.path, fileName);
                var fileStats;
                try {
                    fileStats = fs.statSync(filePath);
                } catch (e) {
                    app.log('Error reading file stats for:', filePath, e.message);
                }
                if (fileStats && fileStats.isDirectory()) {
                    subapps.push(fileName);
                }
            });
    }
    return subapps;
}

var path = require('path'),
    fs = require('fs'),
    App = require('../app');