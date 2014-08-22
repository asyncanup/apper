// # Setup server
// Setup **Express** server under the hood and integrate **Socket.io** for WebSockets
module.exports = function () {
    this.expressApp = express();

    // `server` needs to be attached only if this is the root app,
    // not in the case of a subapp
    if (!this.server) {
        this.server = http.createServer(this.expressApp);
    }

    this.set = this.expressApp.set.bind(this.expressApp);
    
    // `mountPath` is the only property on `this` needed by `this.log`,
    // as well as custom logging extensions, to work well
    this.expressApp.mountPath = this.mountPath;
    this.expressApp.log = this.log;
};

var express = require('express'),
    http = require('http');