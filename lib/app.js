var _ = require("underscore"),
    path = require("path");

var config = require("./config");

// module's export is a function,
// that when called creates and returns a new app
// 
//     var app = require("apper")(__dirname);
// 
// just like connect and express
module.exports = App;

// new App() created for a certain directory path
function App(opts) {
    opts = opts || {};
    
    // if no path sent in to init, nor to App constructor,
    // then take the process's working directory as apper root
    this.path = opts.path || process.cwd();

    var appConfig;
    try {
        appConfig = require(path.join(this.path, "apper.json"));
    } catch(e) {
        appConfig = {};
    }

    // new customizable settings for each App instance
    this.moduleNames = _.defaults(
        (opts.moduleNames || {}),
        appConfig.moduleNames,
        config.defaultModuleNames
    );
    
    this.dirToIgnore = _.uniq(
        (opts.dirToIgnore || [])
            .concat((appConfig.dirToIgnore || []))
            .concat(config.defaultDirToIgnore)
    );

    this.mountPath = opts.mountPath || "";

    // indent starts at 0 to demarcate subapps with increasing indent
    this.indent = opts.indent || 1;

    this.socketIO = opts.socketIO;
}

_.extend(App.prototype, {
    log: require("./log"),
    init: require("./init"),
    start: require("./start")
});
