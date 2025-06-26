export const getAllSourceDoc = {
  '/sources': {
    get: {
      tags: ['Sources'],
      summary: 'List all sources',
      responses: {
        200: {
          description: 'All sources returned successfully',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    nome: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Error retrieving sources',
        },
      },
    },
  },
};
