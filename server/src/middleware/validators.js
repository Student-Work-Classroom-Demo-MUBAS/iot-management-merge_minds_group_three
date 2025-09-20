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
};