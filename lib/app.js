var _ = require("underscore"),
    path = require("path"),
    fs = require("fs");

var config = require("./config");

// Module's export is a function,
// that when called creates and returns a new app
// 
//     var app = require("apper")({
//         path: __dirname
//     });
// 
// `opts` are optional
module.exports = App;

// new App() created for a certain directory path
function App(opts) {
    opts = opts || {};
    
    // if no path sent in to init, nor to App constructor,
    // then take the process's working directory as apper root
    this.path = opts.path || process.cwd();

    var appConfig = {};
    
    this.apperConfigPath = path.join(this.path, "apper.json");
    this.hasApperConfig = fs.existsSync(this.apperConfigPath);
    if (this.hasApperConfig) {
        appConfig = require(this.apperConfigPath);
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
    
    this.staticContentName = opts.staticContentName
        || appConfig.staticContentName
        || config.defaultStaticContentName;

    this.mountPath = opts.mountPath || "";

    this.socketIO = opts.socketIO;
}

_.extend(App.prototype, {
    log: require("./log"),
    init: require("./init"),
    start: require("./start")
});
