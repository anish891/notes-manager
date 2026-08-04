const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const validate = require("../middleware/validate");

const {
    createNoteSchema, updateNoteSchema
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