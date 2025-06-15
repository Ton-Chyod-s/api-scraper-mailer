
export const usuariosDoc = {
  '/users': {
    post: {
      summary: 'Create a new user',
      // description: 'Retorna lista ou dados de usuários. Requer token Bearer válido.',
      tags: ['Users'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string' }
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
  },
};
