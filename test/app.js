var assert = require("assert"),
    path = require("path");

describe('app', function (){
    it("should have log, init, start methods", function () {
        var app = require("./app-maker")();
        
        assert.equal(typeof app.log, "function");
        assert.equal(typeof app.init, "function");
        assert.equal(typeof app.start, "function");
    });
    
    it("should have its path set by argument to constructor", function () {
        var appPath = path.join(__dirname, "sample"),
            app = require("../")({ path: appPath });
        
        assert.equal(app.path, appPath);
    });
    
    describe(".moduleNames", function () {
        var appPath = path.join(__dirname, "sample");
        
        var app = require("../")({
            path: appPath,
            moduleNames: { middleware: "middlewares" }
        });
        
        it("should come from passed arguments first", function () {
            assert.equal(app.moduleNames.middleware, "middlewares");
        });
        
        it("should come from apper.json next", function () {
            assert.equal(app.moduleNames.environment, "env");
        });
        
        it("should come from apper's defaults last", function () {
            assert.equal(app.moduleNames.routes, "routes");
        });
    });

});
