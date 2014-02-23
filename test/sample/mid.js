module.exports = function (app) {
    app.use(function (req, res, next) {
        req.middlewareProperty = true;
        next();
    });
    
    app.socketIO.on("connection", function (socket) {
        app.log("connected to socket.io");
        // console.log(socket);
    });
};
