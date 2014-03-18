var assert = require("assert"),
    request = require("supertest"),
    socketIO = require("socket.io-client"),
    _ = require("underscore");
    
var app = require("./sample/server"),
    serverAddress = app.server.address(),
    socketURL = "http://localhost:" + serverAddress.port,
    socketOpts = { "force new connection" : true };

describe('app.socketIO', function (){
    this.timeout(5000);
    
    it("should serve socket.io static files from root", function (done) {
        request(app.server)
            .get("/socket.io/socket.io.js")
            .expect(200, done);
    });
    
    it("works independently across subapp namespaces", function (done) {
        var rootClient = socketIO.connect(socketURL, socketOpts);
        var subappClient = socketIO.connect(socketURL + "/subapp", socketOpts);
        
        var partDone = _.after(2, done),
            error = function () {
                done(new Error("Didn't work"));
            };
        
        var partConnected = _.after(2, emitStuff);
        
        function emitStuff() {
            app.expressApp.socketIO.emit("hi");
            app.subApps.subapp.expressApp.socketIO.emit("hello");
        }
        
        rootClient.on("connect", partConnected);
        subappClient.on("connect", partConnected);
        
        rootClient.on("hi", partDone);
        subappClient.on("hello", partDone);
        
        rootClient.on("hello", error);
        subappClient.on("hi", error);
    });
    
    it("loads sockets module based on apper.json", function (done) {
        socketIO.connect(socketURL, socketOpts).on("lol", done);
    });
});
