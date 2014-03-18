var assert = require("assert"),
    request = require("supertest"),
    app = require("./sample/server");

describe('app.init', function (){
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
        expressApp.get("/middleware", function (req, res) {
            res.end(req.middlewareProperty);
        });
        
        request(app.server).get("/middleware").expect("lol", done);
    });
    
    it("should load the middleware for post requests", function (done) {
        expressApp.post("/post", function (req, res) {
            res.end(req.body.data);
        });
        
        var body = { data: "some data" };
        request(app.server).post("/post").send(body).expect(body.data, done);
    });
    
    it("should serve static content in public folder", function (done) {
        request(app.server)
            .get("/haha.txt")
            .expect("haha", done);
    });
    
    it("should serve from route, even if index.html is present in public", function (done) {
        request(app.server)
            .get("/")
            .expect("route wala index", done);
    });
});
