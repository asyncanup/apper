var Firebase = require("firebase"),
    _ = require("underscore"),
    shouldbe = require("shouldbe");

module.exports = function (firebasePath, resourceNames, log) {
    var firebaseRoot = new Firebase(firebasePath);
    
    var db = { data: {}},
        data = db.data,
        log = log || console.log.bind(console);

    shouldbe("string", firebasePath);
    shouldbe("array", resourceNames);
    shouldbe("function", log);
    
    resourceNames.forEach(function (resourceName) {
        shouldbe("string", resourceName);
        
        data[resourceName] = {};
        data[resourceName].values = [];
        data[resourceName].ids = [];
        data[resourceName].cloud = firebaseRoot.child(resourceName);
    
        data[resourceName].cloud.on("child_added", function (snap) {
            var remoteItem = snap.val(),
                stringified = JSON.stringify(remoteItem),
                localIndex = data[resourceName].values.length;
            
            data[resourceName].values[localIndex] = remoteItem;
            data[resourceName].ids[localIndex] = snap.name();
            log("Added posts[" + localIndex + "]:\n" + stringified);
        });
        
        data[resourceName].cloud.on("child_removed", function (snap) {
            var remoteItem = snap.val(),
                stringified = JSON.stringify(remoteItem),
                localNames = data[resourceName].ids,
                localItemIndex = localNames.indexOf(snap.name());
            
            if (~localItemIndex) {
                data[resourceName].values.splice(localItemIndex, 1);
                localNames.splice(localItemIndex, 1);
                log("Removed " + resourceName + "[" + localItemIndex + "]:\n" + stringified);
            } else {
                log("Removed " + resourceName + " not in local values: " + stringified);
            }
        });
        
        data[resourceName].cloud.on("child_changed", function (snap) {
            var remoteItem = snap.val(),
                stringified = JSON.stringify(remoteItem),
                localNames = data[resourceName].ids,
                localItemIndex = localNames.indexOf(snap.name());
    
            if (~localItemIndex) {
                data[resourceName].values[localItemIndex] = remoteItem;
                log("Changed " + resourceName + "[" + localItemIndex + "] to:\n" + stringified);
            } else {
                log("Changed " + resourceName + " doesn't exist in local: " + stringified);
            }
        });
    });
    
    db.read = function (resourceName, callback) {
        shouldbe("string", resourceName);
        shouldbe("object", data[resourceName]);
        
        var resources = data[resourceName].values;
        callback(null, resources.map(function (resource, index) {
            var id = data[resourceName].ids[index];
            return _.extend(_.clone(resource), { id: id });
        }));
    };
    
    db.create = function (resourceName, resource, callback) {
        shouldbe("string", resourceName);
        shouldbe("object", data[resourceName]);
        
        var ref = data[resourceName].cloud.push(resource, function (err) {
            if (err) return callback(err);
            callback(null, _.extend(_.clone(resource), { id: ref.name() }));
        });
    };
    
    db.update = function (resourceName, resourceId, attributes, callback) {
        shouldbe("string", resourceName);
        shouldbe("object", data[resourceName]);
        
        var resourceInfo = getResource(data[resourceName], resourceId),
            ref = resourceInfo.ref,
            resource = resourceInfo.resource;
        
        if (!resource) return callback(new Error("Resource not found in database"));
        
        _.extend(resource, _.omit(attributes, "id")); // Can't update id
        ref.set(resource, function (err) {
            if (err) return callback(err);
            callback(null, _.extend(_.clone(resource), { id: resourceId }));
        });
    };
    
    db.delete = function (resourceName, resourceId, callback) {
        shouldbe("string", resourceName);
        shouldbe("object", data[resourceName]);
        
        var resourceInfo = getResource(data[resourceName], resourceId),
            ref = resourceInfo.ref,
            resource = resourceInfo.resource;
            
        if (!resource) return callback(new Error("Resource not found in database"));
        
        ref.remove(function (err) {
            if (err) return callback(err);
            callback(null, _.extend(_.clone(resource), { id: resourceId }));
        });
    };
    
    function getResource(resources, resourceId) {
        shouldbe("object", resources);
        shouldbe("array", resources.ids);
        shouldbe("array", resources.values);
        shouldbe("object", resources.cloud);
        
        var index = resources.ids.indexOf(resourceId),
            resource = resources.values[index];
        
        if (!resource) return {};
        
        return {
            ref: resources.cloud.child(resourceId),
            resource: resource
        };
    }

    return db;
};

