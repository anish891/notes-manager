const NotFoundError = require("../errors/NotFoundError");

function notFound(req, res, next) {
    next(new NotFoundError("Route not found"));
}

module.exports = notFound;