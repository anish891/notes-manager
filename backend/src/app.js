const express = require("express");
const logger = require("./middleware/logger");

const notFound = require("./middleware/notFound");

const authRouter = require("./routes/auth.routes");

const healthRouter = require("./routes/health.routes");

const helmet = require("helmet");

const app = express();

app.use(helmet());

const notesRouter = require("./routes/notes.routes");

const errorHandler = require("./middleware/errorHandler");

app.use(express.json({ limit: "100kb" }));

app.use(logger);

app.use("/auth", authRouter);

app.use("/notes", notesRouter);

app.use("/health", healthRouter);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Student Notes Manager API"
    });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;