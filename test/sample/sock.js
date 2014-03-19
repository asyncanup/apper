module.exports = function (app) {
    app.socketIO.on("connection", function (socket) {
        socket.emit("lol");
    });
};
