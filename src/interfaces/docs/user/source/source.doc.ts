export const sourceDoc = {
  '/sources/list-associated': {
    get: {
      tags: ['Sources'],
      summary: 'List all sources of a user',
      parameters: [
        {
          name: 'userId',
          in: 'query',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'User ID to fetch associated fonts',
        },
      ],
      responses: {
        200: {
          description: 'User-associated fonts returned successfully',
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
          description: 'Error retrieving user-associated fonts',
        },
      },
    },
  },
};
