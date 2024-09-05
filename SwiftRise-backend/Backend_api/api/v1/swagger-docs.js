// Swagger JSDoc configuration
const swaggerJSDoc = require('swagger-jsdoc');
require('dotenv').config();

/**
 * Defines Utility class.
 * 
 * @author Eyang, Daniel Eyoh <https://github.com/Tediyang>
 */

const PATH_PREFIX = '/api/v1';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SwiftRise Backend API',
      version: '1.0.0',
      description: 'SwiftRise Backend API Documentation',
    },
    components: {
      securitySchemes: {
        token: { // This name must match the name used in the security section of your path
          type: 'http', // The type of the security scheme
          scheme: 'bearer', // The name of the HTTP Authorization scheme to be used
          bearerFormat: 'JWT', // Optional, only needed if using bearer tokens
        },
      },
    },
    servers: [
      {
        url: `http://${process.env.APP_HOST}:${process.env.APP_PORT}${PATH_PREFIX}/general`,
        description: 'General Routes Server',
      },
      {
        url: `http://${process.env.APP_HOST}:${process.env.APP_PORT}${PATH_PREFIX}/auth`,
        description: 'Authenticated Routes server',
      },
    ],
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = { swaggerSpec, PATH_PREFIX };
