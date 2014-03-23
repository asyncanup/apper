if (typeof requirejs === "undefined") {
    var requirejs = require('requirejs');
    
    requirejs.config({
        nodeRequire: require
    });
}

requirejs(["dep"], function (dep) {
    console.log(dep);
});
