const express = require("express");
const router = express.Router();
const { loginLimiter } = require("../middleware/rateLimiter");

const validate = require("../middleware/validate");

const {
    registerSchema,
    loginSchema
} = require("../validations/auth.validation");

const {
    register,
    login
} = require("../controllers/auth.controller");


router.post(
    "/register",
    validate(registerSchema),
    register
);

router.post(
    "/login",
    loginLimiter,
    validate(loginSchema),
    login
);

module.exports = router;