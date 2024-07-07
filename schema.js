const joi= require("joi");

module.exports.reviewschema= joi.object({
    review:joi.object({
        rating:joi.number().required(),
        comment:joi.string().required()
    }).required()
})