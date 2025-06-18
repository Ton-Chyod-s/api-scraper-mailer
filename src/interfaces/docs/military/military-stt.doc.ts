

export const militarySttDoc = {
  '/military/stt': {
    get: {
      summary: 'Retrieve Army data from STT source',
      tags: ['Military'],
      responses: {
        200: {
          description: 'Dados consultados com sucesso',
        },
      },
    },
  },
}