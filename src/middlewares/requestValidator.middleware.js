const Validator = require("fastest-validator");
const {AppError} = require("../handlers/error.handler");

const isValidObject = (obj) => {
    return obj && typeof obj === "object";
};

const validate = (body, schema) => {
    const result = {data: {}, errors: []};
    body = isValidObject(body) ? body : {};
    const validator = new Validator();

    const check = validator.compile(schema);
    const validationResult = check(body);

    if (validationResult === true) {
        result.data = body;
    } else {
        result.errors = validationResult;
    }
    return result;
};

/* It validates the payload of the request and if it's not valid, it returns a 400 error */
const validateRequest = (schema) => {
    return (req, res, next) => {
        const payload = (req || {}).body || {};
        const validatedResult = validate(payload, schema);
        if (validatedResult.errors && validatedResult.errors.length) {
            let error_message = "";
            validatedResult.errors.map((error) => error_message += `\n ${error.message}`)
            next(new AppError(error_message, 404));
        }
        req.body = validatedResult.data;
        next();
    };
};

module.exports = {validateRequest, validate};
