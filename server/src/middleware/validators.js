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

module.exports = {
  
  // Auth: Register
  
  registerRules: () => validate([
    body('name').isString().trim().isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters long'),
    body('email').isEmail()
      .withMessage('Valid email is required'),
    body('password').isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
  ]),

  // Auth: Login
  
  loginRules: () => validate([
    body('email').isEmail()
      .withMessage('Valid email is required'),
    body('password').isString().isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
  ]),

  //Device creation
  deviceCreateRules: () => validate([
    body('device_id').isString().trim().isLength({ min: 3 })
      .withMessage('Device ID must be at least 3 characters'),
    body('device_name').isString().trim().isLength({ min: 3 })
      .withMessage('Device name must be at least 3 characters'),
    body('project_tag').optional().isIn(['greenhouse'])
      .withMessage('Project tag must be "greenhouse" if provided'),
    body('location').optional().isString().trim()
  ]),

   // Reading ingestion
 
  readingIngestRules: () => validate([
    body('recorded_at').optional().isISO8601()
      .withMessage('Recorded_at must be a valid ISO8601 date'),
    body('data').isObject()
      .withMessage('Data must be an object')
  ]),

  // Reading query filters
 
  readingQueryRules: () => validate([
    query('from').optional().isISO8601()
      .withMessage('"from" must be a valid ISO8601 date'),
    query('to').optional().isISO8601()
      .withMessage('"to" must be a valid ISO8601 date'),
    query('limit').optional().isInt({ min: 1, max: 5000 })
      .withMessage('"limit" must be between 1 and 5000')
  ])
};