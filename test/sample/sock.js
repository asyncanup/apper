module.exports = function (app) {
    app.sockets.on("connect", function (socket) {
        socket.emit("lol");
    });
};