var assert = require("assert"),
    request = require("supertest"),
    socketIO = require("socket.io-client"),
    _ = require("underscore");
    
var app = require("./sample/server"),
    serverAddress = app.server.address(),
    socketURL = "http://localhost:" + serverAddress.port;

describe('app.socketIO', function (){
    
    it("should serve socket.io static files from root", function (done) {
        request(app.server)
            .get("/socket.io/socket.io.js")
            .expect(200, done);
    });
    
    it("works independently across subapp namespaces", function (done) {
        var rootClient = socketIO.connect(socketURL);
        var subappClient = socketIO.connect(socketURL + "/subapp");
        
        var partDone = _.after(2, done),
            error = function () {
                done(new Error("Didn't work"));
            };
        
        var partConnected = _.after(4, emitStuff);
        
        function emitStuff() {
            app.expressApp.socketIO.emit("hi");
            app.subapps.subapp.expressApp.socketIO.emit("hello");
        }
        
        app.expressApp.socketIO.on("connection", partConnected);
        app.subapps.subapp.expressApp.socketIO.on("connection", partConnected);
        
        rootClient.on("connect", partConnected);
        subappClient.on("connect", partConnected);
        
        rootClient.on("hi", partDone);
        subappClient.on("hello", partDone);
        
        rootClient.on("hello", error);
        subappClient.on("hi", error);
    });
});
