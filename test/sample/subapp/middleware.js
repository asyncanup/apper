module.exports = function (app) {
    app.socketIO.on("connection", function (socket) {
        socket.emit("subapp haha");
        // console.log("got it!");
    });
};
