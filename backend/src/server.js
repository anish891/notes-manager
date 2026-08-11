const app = require("./app");
const config = require("./config/env");
const prisma = require("./config/prisma");

const PORT = config.port;

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

async function shutdown(signal) {
    console.log(`${signal} received. Shutting down gracefully...`);

    server.close(async () => {
        try {
            await prisma.$disconnect();

            console.log("Database connection closed.");
            process.exit(0);
        } catch (err) {
            console.error("Error during shutdown:", err);
            process.exit(1);
        }
    });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));