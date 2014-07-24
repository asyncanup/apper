var portfinder = require("portfinder"),
    openPage = require("opener");

module.exports = function (port, host, callback) {
    var log = this.log.bind(this);
    
    if (!this.didInitialize) return log("Call app.init() to initialize app before starting it.");
    
    if (typeof port === "function") {
        callback = port;
        port = null;
    }
    if (typeof host === "function") {
        callback = host;
        host = null;
    }
    port = port || process.env.PORT;
    host = host || "0.0.0.0";
    
    var toOpenBrowser = this.toOpenBrowser;
    callback = callback || function () {
        var info = this.address();
        log("Serving on " + info.address + ":" + info.port);
        
        if (toOpenBrowser) {
            openPage("http://localhost" + ":" + info.port);
        }
    };

    var server = this.server;
    
    if (!port) {
        portfinder.getPort(function (err, foundPort) {
            port = foundPort;
            startListening();
        });
    } else {
        startListening();
    }

    function startListening() {
        // make the base express server start listening on requests
        server.listen(port, host, callback);
    }
    
    return this;
};
