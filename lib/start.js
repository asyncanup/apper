var portfinder = require("portfinder");

module.exports = function (port, callback) {
    if (typeof port === "function") {
        callback = port;
        port = null;
    }
    
    if (!callback) {
        // create a callback, notifying port,
        // if one is not already present
        callback = function () {
            console.log("Serving on " + this.address().port);
        };
    }

    var server = this.server;
    port = port || process.env.PORT;
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
        server.listen(port, callback);
    }
    
    return this;
};
