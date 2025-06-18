export const sourceDoc = {
  '/users-sources': {
    get: {
      tags: ['User Sources'],
      summary: 'Lista todas as fontes de um usuário',
      parameters: [
        {
          name: 'userId',
          in: 'query',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'ID do usuário para buscar as fontes associadas',
        },
      ],
      responses: {
        200: {
          description: 'Fontes associadas ao usuário retornadas com sucesso',
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
          description: 'Erro na requisição',
        },
      },
    },
  },
};
