var assert = require("assert"),
    request = require("supertest");

describe('init/routes-static', function () {
    var app = require("../app-maker")();

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
    
    it("should respond with updated index.html for minified resources", function (done) {
        request(app.server)
            .get("/subapp")
            .end(function (err, reqRes) {
                var html = reqRes.res.text;
                
                assert(/first\.css\ contents/.test(html));
                assert(/first\.js\ contents/.test(html));
                
                assert(!/second\.css\ contents/.test(html));
                assert(!/second\.js\ contents/.test(html));
                
                // TODO: add tests for leaving remote files as is,
                // after correcting remote file behavior
                
                done();
            });
    });
    
    it("should include requirejs build with response for index.html", function (done) {
        request(app.server)
            .get("/subapp")
                .end(function (err, reqRes) {
                    var html = reqRes.res.text;
                    
                    assert(/dep\.js\ contents/.test(html));
                    
                    done();
                });
    });
});
