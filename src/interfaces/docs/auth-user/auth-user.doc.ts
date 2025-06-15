export const authUserDoc = {
  '/auth/user': {
    post: {
      summary: 'Cria um novo usuário autenticado',
      tags: ['Usuários Autenticados'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { // <-- aqui estava como "shema"
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
