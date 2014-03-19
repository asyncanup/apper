var debug = require("debug");

module.exports = function () {
    this.consoleLogger = debug("apper:" + this.mountPath);
    
    this.appLog = require("../app-log")();
    
    // setup receiving logs from client via sockets
    this.appLog.setupSockets(this.expressApp.socketIO);
};
