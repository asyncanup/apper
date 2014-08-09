module.exports = function (app) {
    app.sockets.use(function (socket) {
        console.log("=====SOCKET!=====");
        socket.emit("lol");
    });
};