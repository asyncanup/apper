var express = require("express"),
    debug = require("debug");

module.exports = function () {
    // if this really is a proper app, then load an express app here
    this.expressApp = express();

    // so that app.use(express.bodyParser()) etc
    // become app.use(app.express.bodyParser())
    this.expressApp.express = express;
    this.expressApp.socketIO = this.socketIO.of(this.mountPath);
    this.expressApp.log = debug(this.mountPath || "/");
    this.expressApp.mountPath = this.mountPath;
};
