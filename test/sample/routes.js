module.exports = function (app) {
    app.get("/lol", function (req, res) {
        res.end("lol");
    });
    
    app.get("/", function (req, res) {
        res.end("route wala index");
    });
};
