const express = require("express");
const router = express.Router();

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

router.get("/", getAllNotes);

router.get("/:id", getNoteById);

router.post(
    "/",
    validate(createNoteSchema),
    createNote
);

router.patch(
    "/:id",
    validate(updateNoteSchema),
    updateNote
);

router.delete("/:id", deleteNote);

module.exports = router;