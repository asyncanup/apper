var _logs = [],
    appLogs;
    
appLogs = function () {
    return _logs;
};

appLogs.push = function (logItem) {
    var itemsToSplice = 0;
    if (this.max && _logs.length > this.max) {
        itemsToSplice = 1;
    }
    
    _logs.splice(0, itemsToSplice, logItem);
};

module.exports = appLogs;
