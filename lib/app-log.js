var _ = require("underscore");

module.exports = function () {
    var _logs = [],
        appLog,
        max;
    
    appLog = function (logData, client) {
        if (!logData) {
            return _logs;
        }
        
        var time = new Date().toUTCString(),
            itemsToSplice = 0;
            
        if (max && _logs.length > max) {
            itemsToSplice = 1;
        }
        
        var logItem = _.extend(logData, {
            _time: time
        });
        if (client) {
            logItem._client = client;
        }
    
        _logs.splice(0, itemsToSplice, logItem);
    };
    
    appLog.setMaxLogs = function (maxLogs) {
        max = maxLogs;
    };
    
    appLog.setupSockets = function (socketIO) {
        socketIO.on("connection", function (socket) {
            socket.on("_log", function (data) {
                appLog(data, socket.id);
                if (data._confirm) {
                    socket.emit("log confirmation", data);
                }
            });
        });
    };
    
    return appLog;
};
