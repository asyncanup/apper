// # Load Sockets
module.exports = function () {
    // `sockets` needs to be attached only if this is the root app,
    // not in the case of a subapp
    if (!this.sockets) {
        this.sockets = sockets(this.server, { log: false });
    }

    // Sockets are namespaced by the application's mount path
    this.expressApp.sockets = this.sockets.of(this.mountPath || "/");
    
    this.appLog.setupSockets(this.expressApp.sockets);
    
    if (this.socketsModulePath && fsUtils.loadModule(this, this.socketsModulePath)) {
        this.log("Loaded sockets.");
    }
};

var sockets = require("socket.io"),
    fsUtils = require("../fs-utils");