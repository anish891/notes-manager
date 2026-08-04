const prisma = require("../config/prisma");

const NotFoundError = require("../errors/NotFoundError");

async function getAllNotes(userId) {
    return await prisma.note.findMany({
        where: {
            userId
        }
    });
}

async function createNote(noteData) {

    return await prisma.note.create({
        data: noteData
    });

}


async function getNoteById(id, userId) {

    const note = await prisma.note.findFirst({
        where: {
            id: Number(id),
            userId
        }
    });

    if (!note) {
        throw new NotFoundError("Note not found");
    }

    return note;

}

async function updateNote(id, userId, noteData) {

    await getNoteById(id, userId);

    return await prisma.note.update({
        where: {
            id: Number(id)
        },
        data: noteData
    });

}

async function deleteNote(id, userId){

await getNoteById(id, userId);

await prisma.note.delete({
    where: {
        id: Number(id)
    }
});

}

module.exports = {
    getAllNotes,
    createNote,
    getNoteById,
    updateNote,
    deleteNote
};