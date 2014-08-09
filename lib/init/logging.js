module.exports = function () {
    this.appLog = require("../app-log")();
    
    // setup receiving logs from client via sockets
    this.appLog.setupSockets(this.expressApp.socketIO);
};