
export const diarioOficialMunicipioDoc = {
  '/diarios/municipio': {
    post: {
      summary: 'Consulta Diário Oficial do Município',
      tags: ['Diário Oficial'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                dateInit: { type: 'string', format: 'date' },
                dateEnd: { type: 'string', format: 'date' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Consulta realizada com sucesso',
        },
      },
    },
  },
}