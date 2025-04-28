# Documentação de Testes com Vitest

## Visão Geral

Vitest é uma biblioteca de testes de JavaScript focada em performance e simplicidade. Ela oferece suporte para testes unitários, integração e testes de ponta a ponta. Os testes são escritos usando uma API similar ao Jest, mas com foco na rapidez de execução e na integração com o Vite.

## Instalação

Primeiro, instale o Vitest e seus tipos de desenvolvimento:

```bash
npm install --save-dev vitest @vitest/ui @vitejs/plugin-vue
```

Se estiver usando o TypeScript, também instale os tipos:

```bash
npm install --save-dev @types/vitest
```

## Configuração

Crie um arquivo de configuração do Vitest (opcional) para personalizar o comportamento dos testes. Em geral, você pode configurar no arquivo vite.config.ts.

```Ts
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { defineConfig as vitestDefineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [{ src: 'src/assets', dest: 'dist' }]
    })
  ],
  test: vitestDefineConfig({
    globals: true,
    environment: 'node',
  }),
});

```

## Estrutura de Arquivos de Testes

Organize seus testes dentro do diretório __test__, Aqui está um exemplo de como pode ser estruturado:

```bash
├── src
│   └── usecases
│       ├── email
│       │   └── send-email-use-case.ts
│       └── user
│           └── create-user.ts
├── __test__
│   └── usecases
│       ├── email
│       │   └── send-email-use-case.spec.ts
│       └── user
│           └── create-user.spec.ts
└── vitest.config.ts
```

## Escrevendo Testes

Os testes são escritos usando funções como describe, it, expect e beforeEach. Aqui está um exemplo de teste simples:

### Exemplo de Teste

Vamos testar uma função addUser, que adiciona um novo usuário ao banco de dados.

```ts
// src/usecases/user/create-user.ts
export const addUser = (name: string, email: string) => {
  if (!name || !email) {
    throw new Error("Invalid input");
  }
  return { id: Date.now(), name, email };
};
```

Arquivo de teste:

```ts
// __test__/usecases/user/create-user.spec.ts
import { describe, it, expect } from 'vitest';
import { addUser } from '../../src/usecases/user/create-user';

describe('addUser', () => {
  it('should add a user with valid data', () => {
    const user = addUser('John Doe', 'john@example.com');
    expect(user).toHaveProperty('id');
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
  });

  it('should throw an error when data is invalid', () => {
    expect(() => addUser('', '')).toThrowError('Invalid input');
  });
});
```

## Comandos de Execução

Para rodar os testes, você pode executar:

```bash
npm run test
```

Ou para ver os testes em tempo real com uma interface de usuário interativa:

```bash
npx vitest
```

## Tipos de Testes

Vitest suporta diferentes tipos de testes:

1. **Testes Unitários:** Teste de funções ou módulos isolados.

2. **Testes de Integração:** Teste de interação entre diferentes partes do sistema.

3. **Testes de Snapshot:** Para verificar que a saída de um componente ou função não mudou inesperadamente.

4. **Testes de Mocking:** Usado para simular dependências e testar o comportamento de funções.

## Exemplo de Mock

Você pode mockar funções usando `vi.fn()` do Vitest:

```ts
// src/usecases/user/create-user.ts
export const sendEmail = (email: string) => {
  // função que envia um e-mail
  return `Email sent to ${email}`;
};

export const addUser = (name: string, email: string) => {
  sendEmail(email);  // Chama a função de envio de e-mail
  return { id: Date.now(), name, email };
};
```

No teste:

```ts
import { vi, it, expect } from 'vitest';
import { addUser, sendEmail } from '../../src/usecases/user/create-user';

vi.mock('../../src/usecases/user/create-user', () => {
  return {
    sendEmail: vi.fn(),
  };
});

it('should send an email when adding a user', () => {
  const email = 'john@example.com';
  addUser('John Doe', email);

  expect(sendEmail).toHaveBeenCalledWith(email);
});
```

## Cobertura de Testes

Vitest fornece suporte para cobertura de testes. Para gerar um relatório de cobertura, você pode adicionar a opção `--coverage` ao comando de execução:

```bash
npx vitest run --coverage
```