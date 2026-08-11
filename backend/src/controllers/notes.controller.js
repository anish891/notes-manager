const notesService = require("../services/notes.service");

async function getAllNotes(req, res, next) {

    try {

        const {
            page,
            limit,
            search,
            sortBy,
            order
        } = req.validatedQuery;

        const result = await notesService.getAllNotes(
            req.user.id,
            page,
            limit,
            search,
            sortBy,
            order
        );

        res.json({
            success: true,
            data: result.notes,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages
            }
        });

    } catch (err) {

        return next(err);

    }

}

async function createNote(req, res, next) {

    try {
        const noteData = {
            ...req.body,
            userId: req.user.id
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

        const note = await notesService.getNoteById(
            req.params.id,
            req.user.id
        );

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

        const updatedNote = await notesService.updateNote(
            req.params.id,
            req.user.id,
            req.body
        );

        res.json({
            success: true,
            data: updatedNote
        });

    } catch (err) {

        next(err);

    }

}

async function deleteNote(req, res, next) {
    try {
        const id = Number(req.params.id);

        await notesService.deleteNote(
            req.params.id,
            req.user.id
        );

        res.status(204).send();

    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllNotes,
    createNote,
    getNoteById,
    updateNote,
    deleteNote,
};