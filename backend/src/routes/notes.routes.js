const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const validate = require("../middleware/validate");
const validateQuery = require("../middleware/validateQuery");

const {
    createNoteSchema, updateNoteSchema, paginationSchema
} = require("../validations/note.validation");

const {
    getAllNotes,
    createNote,
    getNoteById,
    updateNote, 
    deleteNote
} = require("../controllers/notes.controller");

router.get(
    "/",
    authenticate,
    validateQuery(paginationSchema),
    getAllNotes
);

router.get(
    "/:id",
    authenticate,
    getNoteById
);

router.post(
    "/",
    authenticate,
    validate(createNoteSchema),
    createNote
);

router.patch(
    "/:id",
    authenticate,
    validate(updateNoteSchema),
    updateNote
);

router.delete(
    "/:id",
    authenticate,
    deleteNote
);

module.exports = router;