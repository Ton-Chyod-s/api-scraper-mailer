

export const exercitoDoc = {
  '/exercito': {
    get: {
      summary: 'Consulta dados do Exército',
      tags: ['Exército'],
      responses: {
        200: {
          description: 'Dados consultados com sucesso',
        },
      },
    },
  },
}