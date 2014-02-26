module.exports = function (app) {
    app.socketIO.on("connection", function (socket) {
        console.log("got it!");
    });
};
