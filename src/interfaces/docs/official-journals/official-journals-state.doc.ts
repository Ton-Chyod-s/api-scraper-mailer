

export const officialJournalsStateDoc = {
  '/official-journals/state': {
    post: {
      summary: 'Search State Official Journals by filters',
      tags: ['Official Journals'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                dateInit: {
                  type: 'string',
                  pattern: '^\\d{2}/\\d{2}/\\d{4}$',
                  example: '01/01/2025',
                  description: 'Formato esperado: dd/MM/yyyy'
                },
                dateEnd: {
                  type: 'string',
                  pattern: '^\\d{2}/\\d{2}/\\d{4}$',
                  example: '31/12/2025',
                  description: 'Formato esperado: dd/MM/yyyy'
                },
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