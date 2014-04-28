var Firebase = require("firebase"),
    _ = require("underscore"),
    shouldbe = require("shouldbe");

module.exports = function (firebasePath, entities, log) {
    var db = new Firebase(firebasePath);
    
    var data = {},
        log = log || console.log.bind(console);

    shouldbe("string", firebasePath);
    shouldbe("array", entities);
    shouldbe("function", log);
    
    entities.forEach(function (type) {
        data[type] = {};
        data[type].local = [];
        data[type].names = [];
        data[type].cloud = db.child(type);
    
        data[type].cloud.on("child_added", function (snap) {
            var remoteItem = snap.val(),
                stringified = JSON.stringify(remoteItem),
                localIndex = data[type].local.length;
            
            data[type].local[localIndex] = remoteItem;
            data[type].names[localIndex] = snap.name();
            log("Added posts[" + localIndex + "]:\n" + stringified);
        });
        
        data[type].cloud.on("child_removed", function (snap) {
            var remoteItem = snap.val(),
                stringified = JSON.stringify(remoteItem),
                localNames = data[type].names,
                localItemIndex = localNames.indexOf(snap.name());
            
            if (~localItemIndex) {
                data[type].local.splice(localItemIndex, 1);
                localNames.splice(localItemIndex, 1);
                log("Removed " + type + "[" + localItemIndex + "]:\n" + stringified);
            } else {
                log("Removed " + type + " not in local: " + stringified);
            }
        });
        
        data[type].cloud.on("child_changed", function (snap) {
            var remoteItem = snap.val(),
                stringified = JSON.stringify(remoteItem),
                localNames = data[type].names,
                localItemIndex = localNames.indexOf(snap.name());
    
            if (~localItemIndex) {
                data[type].local[localItemIndex] = remoteItem;
                log("Changed " + type + "[" + localItemIndex + "] to:\n" + stringified);
            } else {
                log("Changed " + type + " doesn't exist in local: " + stringified);
            }
        });
    });
    
    return data;
};
