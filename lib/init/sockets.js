var sockets = require("socket.io"),
    http = require("http");

module.exports = function () {
    // if this is the root app
    if (!this.socketIO) {
        this.log("Starting socket.io server.");
        this.server = http.createServer(this.expressApp);
        var io = this.socketIO = sockets.listen(this.server);
    
        io.configure(function () {
            io.set('transports', ['xhr-polling']);
            io.set("polling duration", 20);
            io.set("log level", 1);
        });
    }
}
