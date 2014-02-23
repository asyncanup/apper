var assert = require("assert"),
    request = require("supertest"),
    apper = require("../");

describe('app.init', function (){
    var appPath = require("path").join(__dirname, "sample"),
        app = apper({ path: appPath });
        
    app.init();
    
    var expressApp = app.expressApp;

    it("should have the underlying express object as property", function () {
        assert.equal("function", typeof expressApp);
    });
    
    it("should expose express library as property of underlying express object", function () {
        assert.equal(require("express"), expressApp.express);
    });
    
    it("should create the server object", function () {
        assert(app.server);
    });
    
    it("should setup the socket.io listener", function () {
        assert(app.socketIO);
    });
    
    it("should load the environment for app", function () {
        assert.equal("env value", expressApp.get("env property"));
    });
    
    it("should load the middleware for app", function (done) {
        expressApp.use(function (req) {
            if (req.middlewareProperty) {
                done();
            } else {
                throw "req.middlewareProperty not found";
            }
        });
        
        request(expressApp).get("/random").end();
    });
    
    it("should serve static content in public folder", function (done) {
        request(expressApp)
            .get("/haha.txt")
            .expect("haha", done);
    });
    
    it("should serve index.html if present, at root url", function (done) {
        request(expressApp)
            .get("/")
            .expect("index", done);
    });
});
