
export const authLoginDoc = {
  '/auth/login': {
    post: {
      summary: 'Logar com usuário autenticado',
      tags: ['Usuários Autenticados'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { 
              type: 'object',
              properties: {
                email: { type: 'string' },
                password: { type: 'string' }
              },
              required: ['email', 'password'],
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Usuário logado com sucesso',
        },
        400: {
          description: 'Dados inválidos',
        },
      },
    },
  },
};
