export const sourcesDoc = {
  '/users/sources': {
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
          description: 'Fonte adicionada com sucesso ao usuário.',
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
          description: 'ID de usuário ou ID de fonte inválido',
        },
      },
    },

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
          description: 'User ID to fetch associated sources',
        },
      ],
      responses: {
        200: {
          description: 'Fontes associadas ao usuário retornadas com sucesso.',
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
          description: 'Erro ao recuperar fontes associadas ao usuário',
        },
      },
    },
  },
};
