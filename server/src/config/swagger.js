//set up of swagger documentation
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

//Swagger configuration options
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Greenhouse API',
      version: '1.0.0',
      description: 'API documentation for the Smart Greenhouse project'
    },
    servers: [
      { url: 'http://localhost:3000' } 
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        apiKeyAuth: { type: 'apiKey', in: 'header', name: 'x-api-key' }
      }
    }
  },
  // Look for Swagger JSDoc comments in all route files
  apis: ['**/routes/*.js']
};

// Generate the OpenAPI specification
const specs = swaggerJsdoc(options);

// Function to mount Swagger UI
function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}

module.exports = setupSwagger;