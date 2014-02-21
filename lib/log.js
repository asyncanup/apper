var log = require("debug")("apper");

module.exports = function () {
    var args = [].slice.call(arguments);
    var indentText = new Array(this.indent).join("- ");
    log.call(null, [indentText].concat(args).join(" "));
};