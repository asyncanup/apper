module.exports = function () {
    // if a static content directory exists for current app, expose it
    if (this.hasStaticContent) {
        this.expressApp.use("/", this.expressApp.express.static(this.staticContentPath));
        this.log("Exposed " + this.staticContentPath);
    }
};
