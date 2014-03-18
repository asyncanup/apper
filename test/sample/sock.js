module.exports = function (app) {
    console.log("loaded");
    app.socketIO.on("connection", function (socket) {
        socket.emit("lol");
    });
};
