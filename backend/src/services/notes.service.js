const prisma = require("../config/prisma");

const NotFoundError = require("../errors/NotFoundError");

async function getAllNotes(
    userId,
    page = 1,
    limit = 10,
    search = ""
) {

    const skip = (page - 1) * limit;

    const searchFilter = search
        ? {
            OR: [
                {
                    title: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    content: {
                        contains: search,
                        mode: "insensitive"
                    }
                }
            ]
        }
        : {};

    const where = {
        userId,
        ...searchFilter
    };

    const [notes, total] = await Promise.all([
        prisma.note.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc"
            }
        }),

        prisma.note.count({
            where
        })
    ]);

    return {
        notes,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
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

async function deleteNote(id, userId) {

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