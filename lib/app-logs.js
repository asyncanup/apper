var _logs = [],
    appLogs,
    max;
    
appLogs = function () {
    return _logs;
};

appLogs.push = function (logItem) {
    var time = new Date().toUTCString(),
        itemsToSplice = 0;
        
    if (max && _logs.length > max) {
        itemsToSplice = 1;
    }
    
    _logs.splice(0, itemsToSplice, [time].concat(logItem));
};

appLogs.setMax = function (maxLogs) {
    max = maxLogs;
};

appLogs.setupSockets = function (socketIO) {
    socketIO.on("connection", function (socket) {
        socket.on("log", function (data) {
            appLogs.push([socket.id].concat(data));
        });
    });
};

module.exports = appLogs;
