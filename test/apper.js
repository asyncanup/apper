var assert = require("assert");

var apper = require("../"),
    App = require("../lib/app");

describe("exports", function () {
    
    it("should be a function", function () {
        assert.equal("function", typeof apper);
    });
    
    it("should expose underlying app constructor", function () {
        assert.equal(App, apper.App);
    });
});
