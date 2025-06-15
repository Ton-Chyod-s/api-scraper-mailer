
export const authLoginUserDoc = {
  '/auth/login': {
    post: {
      summary: 'Authenticate user and return JWT token',
      tags: ['Auth'],
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
