const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tours & Auth API',
      version: '1.0.0',
      description: 'API documentation for Tours and Auth endpoints',
    },
    servers: [
      {
        url: 'http://localhost:8000',
      },
    ],
  },
  apis: ['./index.js', './routes/*.js'], // Đường dẫn tới các file định nghĩa endpoint
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec }; 