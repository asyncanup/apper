var _ = require("underscore");

module.exports = function () {
    var _logs = [],
        appLog,
        max;
    
    appLog = function (logItem) {
        var time = new Date().toUTCString(),
            itemsToSplice = 0;
        
        logItem.time = time;
        if (max && _logs.length > max) {
            itemsToSplice = 1;
        }
        _logs.splice(0, itemsToSplice, logItem);
    };
    
    appLog.get = function () {
        return _logs;
    }
    
    appLog.setMaxLogs = function (maxLogs) {
        max = maxLogs;
    };
    
    appLog.setupSockets = function (socketIO) {
        socketIO.on("connection", function (socket) {
            socket.on("_log", function () {
                appLog({ data: arguments, client: socket.id });
            });
        });
    };
    
    return appLog;
};
