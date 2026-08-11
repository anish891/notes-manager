const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 5,

    standardHeaders: true,

    legacyHeaders: false,

    skip: () =>
        process.env.NODE_ENV === "test" &&
        process.env.TEST_RATE_LIMITING !== "true",

    message: {
        success: false,
        message: "Too many login attempts. Please try again later."
    }
});

module.exports = {
    loginLimiter
};