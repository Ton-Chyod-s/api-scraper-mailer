# Documentação de Banco de Dados

O banco de dados é utilizado para armazenar informações essenciais para o funcionamento do sistema, como dados de usuários, registros de tarefas executadas e e-mails enviados.

O Prisma ORM é utilizado para modelar o esquema e gerenciar as migrações.

---

## Esquema do Banco de Dados

### 1. Tabela `users`

Armazena informações dos usuários cadastrados no sistema.

- **Campos**:
  - `id` (Integer) — Chave Primária (PK)
  - `name` (String)
  - `email` (String) — Único

### 2. Tabela `task_log`

Armazena o log de execuções de tarefas automáticas do sistema.

- **Campos**:
  - `id` (Integer) — Chave Primária (PK)
  - `task_name` (String) — Nome da tarefa
  - `executed_at` (DateTime) — Data e hora da execução (default: agora)

**Definição no Prisma:**

```prisma
model User {
  id      Int      @id @default(autoincrement())
  name    String?
  email   String   @unique
  createdAt DateTime @default(now())
} 

model task_log {
  id          Int      @id @default(autoincrement())
  task_name   String
  executed_at DateTime @default(now())
}
```

## Migrações de Banco de Dados

As migrações são gerenciadas utilizando o Prisma Migrate.

Para criar e aplicar uma nova migração:

```bash
npx prisma migrate dev --name <nome-da-migracao>
```
Exemplo:
```bash
npx prisma migrate dev --name add-task-log
```
As migrações criam as alterações no banco de dados de forma controlada, mantendo o histórico de modificações.

## Localização dos Arquivos Relacionados

- Definições do banco: prisma/schema.prisma
- Cliente de acesso ao banco: src/infrastructure/db/pg-client.ts
- Entidades:
  - src/domain/entities/User.ts
  - src/domain/entities/task-log.ts
- Repositórios:
  - src/domain/repositories/user-repository.ts
  - src/domain/repositories/task-log-repository.ts
- Casos de Uso:
  - src/usecases/user
  - src/usecases/task-log

## Observações
- O Prisma facilita a abstração de consultas complexas e a manutenção do banco de dados.
- A estrutura segue a Arquitetura Limpa, separando claramente as camadas de domínio, casos de uso e infraestrutura.

