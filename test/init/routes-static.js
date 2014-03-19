var request = require("supertest");

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
});
