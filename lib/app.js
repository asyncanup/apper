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
    
    if (this.didInitialize) return this;
    
    this.mountPath = opts.mountPath || "";
    
    // if no path sent in to init, nor to App constructor,
    // then take the process's working directory as apper root
    this.path = (opts.path && path.resolve(opts.path)) || process.cwd();

    this.appConfig = {};
    
    this.apperConfigPath = path.join(this.path, "apper.json");
    this.hasApperConfig = fs.existsSync(this.apperConfigPath);
    if (this.hasApperConfig) {
        try {
            this.appConfig = require(this.apperConfigPath);
        } catch (e) {
            this.log("Problem loading Apper config:\n" + e.stack);
        }
    }
    
    // new customizable settings for each App instance
    this.moduleNames = _.defaults(
        (opts.moduleNames || {}),
        this.appConfig.moduleNames,
        config.defaultModuleNames
    );
    
    this.dirToIgnore = _.uniq(
        (opts.dirToIgnore || [])
            .concat((this.appConfig.dirToIgnore || []))
            .concat(config.defaultDirToIgnore)
    );
    
    this.staticContentName = opts.staticContentName ||
        this.appConfig.staticContentName ||
        config.defaultStaticContentName;

    // important to judge whether this is a root app or a subapp
    this.socketIO = opts.socketIO;
    
    if (!this.init()) {
        this.log("Could not initialize apper at: " + this.path);
    } else {
        this.didInitialize = true;
        this.toOpenBrowser = opts.toOpenBrowser;
    }
    
    if (opts.port) this.port = opts.port;
    if (opts.host) this.host = opts.host;
}

_.extend(App.prototype, {
    log: require("./log"),
    init: require("./init"),
    start: require("./start")
});