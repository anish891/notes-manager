const prisma = require("../config/prisma");

const NotFoundError = require("../errors/NotFoundError");

async function getAllNotes() {
    return await prisma.note.findMany();
}

async function createNote(noteData) {

    return await prisma.note.create({
        data: noteData
    });

}


async function getNoteById(id) {

    const note = await prisma.note.findUnique({
        where: { id }
    });

    if (!note) {
        throw new NotFoundError("Note not found");
    }

    return note;

}

async function updateNote(id, noteData) {

    await getNoteById(id);

    return prisma.note.update({
        where: {
            id
        },
        data: noteData
    });

}

module.exports = {
    getAllNotes,
    createNote,
    getNoteById,
    updateNote
};