const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'JOE API',
      version: '1.0.0',
      description: 'Journal of Everything — REST API for scientific manuscript submission, peer review, and publication.',
    },
    servers: [
      {
        // TODO: set API_URL env var to the production API base URL
        url: process.env.API_URL || 'http://localhost:2000',
        description: process.env.NODE_ENV === 'production' ? 'Production' : 'Local development',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'jwt',
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  // Pick up @swagger JSDoc annotations from all route files
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
