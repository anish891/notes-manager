const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/env");

const ConflictError = require("../errors/ConflictError");
const UnauthorizedError = require("../errors/UnauthorizedError");

async function register(userData) {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: userData.email
        }
    });

    if (existingUser) {
        throw new ConflictError("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = {
        ...userData,
        password: hashedPassword
    };

    const user = await prisma.user.create({
        data: newUser,
        select: {
            id: true,
            name: true,
            email: true
        }
    });

    return user;
}

async function login(loginData) {
    const user = await prisma.user.findUnique({
        where: {
            email: loginData.email
        },
        select: {
            id: true,
            name: true,
            email: true,
            password: true
        }
    });

    if (!user) {
        throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
        loginData.password,
        user.password
    );

    if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid email or password");
    }

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        config.jwtSecret,
        {
            expiresIn: "1d"
        }
    );

    return {
        token
    };
}

module.exports = {
    register,
    login
};