module.exports = function (app) {
    app.use(function (req, res, next) {
        req.middlewareProperty = "lol";
        next();
    });
    
    app.use(app.express.bodyParser());
    
    app.socketIO.on("connection", function (socket) {
        socket.emit("haha");
    });
};
