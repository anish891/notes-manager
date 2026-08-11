function validateQuery(schema) {

    return (req, res, next) => {

        const { error, value } = schema.validate(req.query);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        req.validatedQuery = value;

        next();
    };

}

module.exports = validateQuery;