import swaggerJSDoc from "swagger-jsdoc";
import { swaggerPaths } from "@interfaces/docs";

const swaggerConfig = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "api-scraper-mailer",
      version: "1.0.0",
      description: "Documentação da API",
    },
    paths: swaggerPaths,
  },
  apis: ["./src/interfaces/routes/*.ts"], 
};

export const swaggerSpec = swaggerJSDoc(swaggerConfig);
