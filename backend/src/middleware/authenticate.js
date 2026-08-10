const jwt = require("jsonwebtoken");

const config = require("../config/env");
const UnauthorizedError = require("../errors/UnauthorizedError");

function authenticate(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(
            new UnauthorizedError("Authentication required")
        );
    }

    const token = authHeader.substring(7);

    try {

        const decoded = jwt.verify(
            token,
            config.jwtSecret
        );

        req.user = decoded;

        next();

    } catch (err) {

        return next(
            new UnauthorizedError("Invalid or expired token")
        );

    }
}

module.exports = authenticate;