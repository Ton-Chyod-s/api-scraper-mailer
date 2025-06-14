
export const usuariosDoc = {
  '/pessoas': {
    post: {
      summary: 'Cria um novo usuário',
      tags: ['Usuários'],
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
  },
};
