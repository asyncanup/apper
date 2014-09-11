// # App constructor
// ## Main Application constructor

module.exports = App;
function App(opts) {
    opts = opts || {};
    if (this.didInitialize) return this;
    
    // `mountPath` defines the relative URL of a subapp with respect to root
    this.mountPath = opts.mountPath || '';
    
    // `path` defines the folder to take as root for the application.
    // If not defined, take the current working directory.
    this.path = (opts.path && path.resolve(opts.path)) || process.cwd();

    // ### Configuration
    // Application can be configured via options in `apper.json`
    this.appConfig = {};
    this.apperConfigPath = path.join(this.path, 'apper.json');
    this.hasApperConfig = fs.existsSync(this.apperConfigPath);
    if (this.hasApperConfig) {
        try {
            this.appConfig = require(this.apperConfigPath);
        } catch (e) {
            this.log('Problem loading Apper config:\n' + e.stack);
        }
    }
    
    // Module names for `environment`, `routes`, etc. can be changed via configuration
    this.moduleNames = _.defaults(
        (opts.moduleNames || {}),
        this.appConfig.moduleNames,
        config.defaultModuleNames
    );

    // Directories that must specifically not be taken as subapps can be mentioned     
    this.dirToIgnore = _.uniq(
        (opts.dirToIgnore || [])
            .concat((this.appConfig.dirToIgnore || []))
            .concat(config.defaultDirToIgnore)
    );
    
    // The directory to serve static content can have a custom name
    this.staticDir = opts.staticDir ||
        this.appConfig.staticDir ||
        config.defaultStaticContentName;

    // ### WebSockets
    // Single WebSocket connection can be shared between subapps
    this.sockets = opts.sockets;
    
    // ### Initialize
    // Initialization returns `false` if it was not successful
    if (!this.init()) {
        this.log('Could not initialize apper at: ' + this.path);
    } else {
        this.didInitialize = true;
        this.toOpenBrowser = opts.toOpenBrowser;
    }
    
    if (opts.port) this.port = opts.port;
    if (opts.host) this.host = opts.host;
}

App.prototype.log = require('./log');
App.prototype.init = require('./init');
App.prototype.start = require('./start');

// ## Module Dependencies

var _ = require('underscore'),
    path = require('path'),
    fs = require('fs');

// Load default configuration
var config = require('./config');