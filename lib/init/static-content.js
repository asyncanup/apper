// # Expose Static Content
// If a static content directory exists in folder, expose it on mount path
module.exports = function () {
    if (this.hasStaticContent) {
        this.expressApp.use("/", express.static(this.staticContentPath));
        this.log("Exposed " + this.staticContentPath);
    }
};

var express = require("express");