const Joi = require("joi");

const createNoteSchema = Joi.object({
    title: Joi.string()
        .min(3)
        .max(100)
        .required(),

    content: Joi.string()
        .min(1)
        .required()
});

const paginationSchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
});

const updateNoteSchema = Joi.object({
    title: Joi.string().min(3).max(100),
    content: Joi.string().min(1)
})
.min(1)
.unknown(false);

module.exports = {
    createNoteSchema,
    updateNoteSchema,
    paginationSchema
};