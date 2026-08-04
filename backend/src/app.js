const express = require("express");
const logger = require("./middleware/logger");

const healthRouter = require("./routes/health.routes");

const app = express();

const notesRouter = require("./routes/notes.routes");

const errorHandler = require("./middleware/errorHandler");

app.use(express.json());

app.use(logger);

app.use("/notes", notesRouter);

app.use("/health", healthRouter);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Student Notes Manager API"
    });
});

app.use(errorHandler);

module.exports = app;