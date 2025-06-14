import swaggerJSDoc from "swagger-jsdoc";

const swaggerConfig = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "api-scraper-mailer",
      version: "1.0.0",
      description: "Documentação da API",
    },
  },
  apis: ["./src/interfaces/routes/*.ts"], 
};

export const swaggerSpec = swaggerJSDoc(swaggerConfig);
