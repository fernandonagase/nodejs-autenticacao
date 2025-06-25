import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sistema de autenticação",
      version: "1.0.0",
      description: "Documentação da API",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
    tags: [
      {
        name: "Autenticação",
        description: "Operações relacionadas à autenticação de usuários",
      },
    ],
  },
  apis: ["src/routes/*.ts"],
};

const openapiSpecification = swaggerJsdoc(options);

export default openapiSpecification;
