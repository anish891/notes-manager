const requiredEnv = [
    "DATABASE_URL",
    "JWT_SECRET"
];

for (const key of requiredEnv) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}

module.exports = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET
};