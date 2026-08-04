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

const updateNoteSchema = Joi.object({
    title: Joi.string().min(3).max(100),
    content: Joi.string().min(1)
})
.min(1)
.unknown(false);

module.exports = {
    createNoteSchema,
    updateNoteSchema
};