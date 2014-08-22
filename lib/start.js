// # Start Server
// Make application start listening on specified `port` and `host`
module.exports = function (port, host, callback) {
    
    // Don't start listening on requests unless application initialization is done
    if (!this.didInitialize) return this.log('Call app.init() to initialize app before starting it.');
    
    // Gather arguments in proper order
    if (typeof port === 'function') {
        callback = port;
        port = null;
    }
    if (typeof host === 'function') {
        callback = host;
        host = null;
    }
    
    // Supply defaults
    port = port || this.port || process.env.PORT;
    host = host || this.host || '0.0.0.0';

    var server = this.server;
    
    // If the supplied port is not open, find a new one which is open
    if (!port) {
        portfinder.getPort(function (err, foundPort) {
            port = foundPort;
            startListening();
        });
    } else {
        startListening();
    }
    
    // Supply a default callback
    var app = this;
    callback = callback || function () {
        var info = this.address(),
            logMsg = 'Serving on ' + info.address + ':' + info.port;

        // which logs confirmation once server has started
        app.log.print(logMsg);
        
        // and if asked, opens a browser when started
        // (for example, when using the command-line tool to run application)
        if (app.toOpenBrowser) {
            openPage('http://localhost' + ':' + info.port);
        }
    };

    function startListening() {
        // And finally start listening
        server.listen(port, host, callback);
    }
    
    return this;
};

var portfinder = require('portfinder'),
    openPage = require('opener');