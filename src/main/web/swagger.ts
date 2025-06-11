import swaggerJSDoc from "swagger-jsdoc";

const swaggerConfig = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "JubileuTaskListAPI",
      version: "1.0.0",
      description: "Documentação da API de tarefas com autenticação JWT",
    },
  },
  apis: ["./src/main/web/routes/*.ts"], 
};

export const swaggerSpec = swaggerJSDoc(swaggerConfig);
