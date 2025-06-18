export const usersDoc = {
  '/users': {
    post: {
      summary: 'Create a new user',
      tags: ['Users'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Usuário criado com sucesso',
        },
      },
    },
    get: {
      summary: 'Retrieve all users',
      tags: ['Users'],
      responses: {
        200: {
          description: 'Usuários recuperados com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    id: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },

  },
};
