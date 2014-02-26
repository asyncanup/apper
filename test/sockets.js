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
    
    it("is able to connect", function (done) {
        var client = socketIO.connect(socketURL);
        
        var partDone = _.after(2, done);
        
        app.expressApp.socketIO.on("connection", partDone);
        client.on("connect", partDone);
    });
    
    it.skip("works independently across subapp namespaces", function (done) {
        var rootClient = socketIO.connect(socketURL);
        var subappClient = socketIO.connect(socketURL + "/subapp");
        
        var partDone = _.after(2, done),
            throwErr = function () {
                done(new Error("Mixed up namespaces"));
            };
        
        app.expressApp.socketIO.emit("hi");
        app.subapps["subapp"].expressApp.socketIO.emit("hello");
        
        rootClient.on("hi", partDone);
        subappClient.on("hello", partDone);
        
        rootClient.on("hello", throwErr);
        subappClient.on("hi", throwErr);
    });
});
