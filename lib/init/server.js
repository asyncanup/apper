var express = require("express"),
    sockets = require("socket.io"),
    http = require("http");

var appLogs = require("../app-logs");

module.exports = function () {
    // if this really is a proper app, then load an express app here
    this.expressApp = express();

    // so that app.use(express.bodyParser()) etc
    // become app.use(app.express.bodyParser())
    this.expressApp.express = express;
    this.expressApp.log = this.log;
    this.expressApp.mountPath = this.mountPath;

    // if this is the root app
    if (!this.socketIO) {
        this.expressApp.get("/_logs", function (req, res) {
            res.json(appLogs());
        });
        
        this.server = http.createServer(this.expressApp);
        
        var io = this.socketIO = sockets.listen(this.server);
    
        io.configure(function () {
            io.set('transports', ['xhr-polling']);
            io.set("polling duration", 20);
            io.set("log level", 1);
        });
        
        appLogs.setupSockets(this.socketIO.of(this.mountPath));
    }
    
    this.expressApp.socketIO = this.socketIO.of(this.mountPath);
};
