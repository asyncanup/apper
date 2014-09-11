// # Expose Static Content
// If a static content directory exists in folder, expose it on mount path
module.exports = function () {
    if (this.hasStaticContent) {
        this.expressApp.use('/', express.static(this.staticDirPath));
        this.log('Exposed ' + this.staticDirPath);
    }
};

var express = require('express');