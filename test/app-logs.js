var assert = require("assert"),
    request = require("supertest"),
    socketIO = require("socket.io-client"),
    _ = require("underscore");
    
var app = require("./sample/server"),
    serverAddress = app.server.address(),
    socketURL = "http://localhost:" + serverAddress.port;

describe('app-log', function (){
    
    it("should handle /_logs route for server logs", function (done) {
        request(app.server)
            .get("/_logs")
            .end(function (err, reqRes) {
                if (err) { return done(err); }
                
                var json = reqRes.res.body;
                
                assert(_.findWhere(json , {
                    mountPath: "",
                    data: "Loaded environment."
                }));
                
                assert(_.findWhere(json , {
                    mountPath: "",
                    data: "Loaded middleware."
                }));
                
                assert(_.findWhere(json , {
                    mountPath: "/subapp",
                    data: "Loaded middleware."
                }));
                
                assert(_.findWhere(json , {
                    mountPath: "/subapp",
                    data: "Loaded routes."
                }));
                
                assert(_.findWhere(json , {
                    mountPath: "",
                    data: "Loaded routes."
                }));
                
                done();
            });
    });
    
    it("accepts logs from clients using sockets", function (done) {
        var client = socketIO.connect(socketURL, {
            "force new connection": true
        });
        
        client.on("connect", function () {
            client.emit("_log", { data: "some data" });
        });
    
        setTimeout(function () {
            request(app.server)
                .get("/_logs")
                .end(function (err, reqRes) {
                    if (err) { return done(err); }
                    
                    var json = reqRes.res.body;
                    assert(_.findWhere(json, {
                        data: "some data",
                        _client: client.socket.sessionid
                    }));
                    
                    done();
                });
        }, 200);
    });
});
