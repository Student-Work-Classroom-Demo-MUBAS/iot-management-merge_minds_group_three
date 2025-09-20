//Validation middleware

const { body, query, validationResult } = require('express-validator');

/**
 * Wraps an array of validation rules and checks for errors.
 * If errors exist, responds with 422 and the error details.
 */
const validate = rules => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  }
];