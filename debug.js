var debug = require("debug");

var mylog = debug("mylog"),
    log = debug("log"),
    applog = debug("app:log"),
    apperror = debug("app:error");
    
mylog.log = console.log.bind(console);
mylog("mylog bound");

apperror.log = console.error.bind(console);
apperror("mylog bound");

debug.log = console.log.bind(console);
log("log bound");

mylog("mylog");
log("log");
applog("applog");
apperror("apperror");

