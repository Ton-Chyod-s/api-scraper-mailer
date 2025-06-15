export const authRegisterUserDoc = {
  '/auth/register': {
    post: {
      summary: 'Register a new user and return JWT token',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { 
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string' },
                password: { type: 'string' },
                confirmPassword: { type: 'string' }
              },
              required: ['name', 'email', 'password'],
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Usuário criado com sucesso',
        },
        400: {
          description: 'Dados inválidos',
        },
      },
    },
  },
};
