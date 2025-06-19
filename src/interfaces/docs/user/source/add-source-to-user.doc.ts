export const addSourceToUserDoc = {
  '/sources/add': {
    post: {
      tags: ['Sources'],
      summary: 'Add a source to a user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                userId: { type: 'integer', description: 'ID of the user' },
                sourceId: { type: 'integer', description: 'ID of the source' },
              },
              required: ['userId', 'sourceId'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Source added successfully to the user',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Fonte adicionada com sucesso ao usuário.' },
                },
              },
            },
          },
        },
        400: {
          description: 'Invalid user ID or source ID',
        },
      },
    },
  },
}