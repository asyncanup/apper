// # WebSocket Logger
// Unified logging for client & server
module.exports = function () {
    
    // In-memory array holds all logs since start of server
    var _logs = [],
        max;
    
    // Getting the list of current logs is straightforward
    appLog.get = function () {
        return _logs;
    };
    
    // Setting a maximum length for logs is helpful for purging
    appLog.setMaxLogs = function (maxLogs) {
        max = maxLogs;
    };
    
    var log = require("debug")("apper:test");
        
    // Logs from connected clients get added to the mix as well
    appLog.setupSockets = function (sockets) {
        sockets.on("connection", function (socket) {
            socket.on("_log", function () {
                appLog({ data: arguments, client: socket.id });
                
                var callback = arguments[arguments.length - 1];
                if (typeof callback === "function") {
                    callback();
                }
            });
        });
    };
    
    // Adding a new log adds a timestamp to it, also taking care of purging
    function appLog(logItem) {
        var time = new Date().toUTCString(),
            itemsToSplice = 0;
        
        logItem.time = time;
        if (max && _logs.length > max) {
            itemsToSplice = 1;
        }
        _logs.splice(0, itemsToSplice, logItem);
    }
    
    return appLog;
};

var _ = require("underscore");