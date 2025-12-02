import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OAuth2 Server API',
      version: '1.0.0',
      description: 'OAuth2 Server API Documentation',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        clientId: {
          type: 'apiKey',
          name: 'x-client-id',
          in: 'header',
        },
      },
    },
  },
  apis: ['./src/routers/*/*.ts', './src/routers/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
