var path = require("path");

var fsUtils = require("../fs-utils"),
    App = require("../app");

module.exports = function () {
    this.subApps = {};
    // start a new app for all subApps and mount them under the current one
    var subAppNames = fsUtils.subAppNames(this), i;
    for (i = 0; i < subAppNames.length; i++) {
        var name = subAppNames[i];
        var subApp = new App({
            path: path.join(this.path, name),
            indent: this.indent,
            mountPath: this.mountPath + "/" + name,
            socketIO: this.socketIO
        });

        // if the subApp's initialization was successful,
        if (subApp.init()) {
            // mount it as a subApp of the parent app
            this.expressApp.use("/" + name, subApp.expressApp);
            this.subApps[name] = subApp;
        }
    }    
};
