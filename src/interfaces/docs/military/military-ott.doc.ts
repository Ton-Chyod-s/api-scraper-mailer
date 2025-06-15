

export const exercitoDoc = {
  '/military/ott': {
    get: {
      summary: 'Retrieve Army data from OTT source',
      tags: ['Military'],
      responses: {
        200: {
          description: 'Dados consultados com sucesso',
        },
      },
    },
  },
}