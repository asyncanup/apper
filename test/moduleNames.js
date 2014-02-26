var assert = require("assert");

var apper = require("../");

describe("app.moduleNames", function () {
    var path = require("path").join(__dirname, "sample"),
        app = apper({
            path: path,
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
    })
});
