var portfinder = require("portfinder");

module.exports = function (port, host, callback) {
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
    callback = callback || function () {
        var info = this.address();
        console.log("Serving on " + info.address + ":" + info.port);
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
