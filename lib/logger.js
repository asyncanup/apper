(function () {
    "use strict";

    var log = function () {
        console.log.apply(console, arguments);
    }

    log.err = function () {
        log.apply(this, arguments);
    };

    module.exports = log;
}());
