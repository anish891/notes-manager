const notesService = require("../services/notes.service");

async function getAllNotes(req, res, next) {

    try {
        const notes = await notesService.getAllNotes();
        res.json({
            success: true,
            data: notes
        });
    } catch (err) {
        return next(err);
    }

}

async function createNote(req, res, next) {

    try {
        const noteData = {
            ...req.body,
            userId: 1
        };

        const note = await notesService.createNote(noteData);

        res.status(201).json({
            success: true,
            data: note
        });

    } catch (err) {

        return next(err);
    }
}

async function getNoteById(req, res, next) {

    try {

        const id = Number(req.params.id);

        const note = await notesService.getNoteById(id);

        res.json({
            success: true,
            data: note
        });

    } catch (err) {

        next(err);

    }

}

async function updateNote(req, res, next) {

    try {

        const id = Number(req.params.id);

        const updatedNote = await notesService.updateNote(id, req.body);

        res.json({
            success: true,
            data: updatedNote
        });

    } catch (err) {

        next(err);

    }

}

module.exports = {
    getAllNotes,
    createNote, 
    getNoteById,
    updateNote
};