var assert = require("assert"),
    request = require("supertest"),
    socketIO = require("socket.io-client"),
    _ = require("underscore");

describe('app-log', function (){
    it("should handle /_logs route for root server logs", function (done) {
        var app = require("./app-maker")();
    
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
                    mountPath: "",
                    data: "Loaded sockets."
                }));
                
                assert(_.findWhere(json , {
                    mountPath: "",
                    data: "Loaded routes."
                }));
                
                done();
            });
    });
    
    it("should handle /subapp/_logs route for subapp server logs", function (done) {
        var app = require("./app-maker")();
    
        request(app.server)
            .get("/subapp/_logs")
            .end(function (err, reqRes) {
                if (err) { return done(err); }
                
                var json = reqRes.res.body;
                
                assert(_.findWhere(json , {
                    mountPath: "/subapp",
                    data: "Loaded middleware."
                }));
                
                assert(_.findWhere(json , {
                    mountPath: "/subapp",
                    data: "Loaded routes."
                }));
                
                done();
            });
    });
    
    it("accepts logs from clients using sockets", function (done) {
        var app = require("./app-maker")();
        
        app.start(function () {
            var serverAddress = app.server.address(),
                socketURL = "http://localhost:" + serverAddress.port,
                socketOpts = { "force new connection": true };
            
            var client = socketIO.connect(socketURL, socketOpts),
                logData = { key: "value", _confirm: true };
            
            client.on("connect", function () {
                client.emit("_log", logData);
            });
        
            client.on("log confirmation", function (confirmationData) {
                Object.keys(logData).forEach(function (key) {
                    assert.equal(logData[key], confirmationData[key]);
                });
                
                request(app.server)
                    .get("/_logs")
                    .end(function (err, reqRes) {
                        if (err) { return done(err); }
                        
                        var json = reqRes.res.body;
                        assert(_.findWhere(json, _.extend({}, logData, {
                            _client: client.socket.sessionid
                        })));
                        
                        done();
                    });
            });
        });
    });
});
