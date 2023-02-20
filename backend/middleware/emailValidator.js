const validator = require("email-validator");
 
validator.validate("test@email.com");

module.exports = (req, res, next) => {
    if (!validator.validate(req.body.email)) {
        res.status(400).json({message: "Email non conforme"});
    } else {
        next()
    }
}