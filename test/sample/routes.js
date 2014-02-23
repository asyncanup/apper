module.exports = function (app) {
    app.get("/lol", function (req, res) {
        res.end("lol");
    });
};
