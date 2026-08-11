const AppError = require("../errors/AppError");

function errorHandler(err, req, res, next) {

    console.error(err);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    if (err.status === 413) {
        return res.status(413).json({
            success: false,
            message: "Request body too large"
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
}

module.exports = errorHandler;