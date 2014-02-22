var assert = require("assert"),
    express = require("express"),
    apper = require("../");

describe('app', function (){
    it("should have log, init, start methods", function () {
        var app = apper();
        
        assert.equal(typeof app.log, "function");
        assert.equal(typeof app.init, "function");
        assert.equal(typeof app.start, "function");
    });
    
    it("should have its path set by argument to constructor", function () {
        var path = require("path").join(__dirname, "sample");
        
        var app = apper({
            path: path
        });
        
        assert.equal(app.path, path);
    });
    
    it('should have underlying express app as property', function (){
        var app = apper();
        
        // assert.equal(typeof app.expressApp, "function");
        // assert.equal(typeof app.expressApp.express, express);
        
    });
});
