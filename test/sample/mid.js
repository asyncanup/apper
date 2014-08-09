module.exports = function (app) {
    app.use(function (req, res, next) {
        req.middlewareProperty = "lol";
        next();
    });
    
    app.use(app.express.urlencoded());
    app.use(app.express.json());
    
    app.socketIO.on("connection", function (socket) {
        socket.emit("haha");
    });
};
