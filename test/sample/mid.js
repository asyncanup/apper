module.exports = function (app) {
    app.use(function (req, res, next) {
        req.middlewareProperty = true;
        next();
    });
};