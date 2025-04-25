
### 3. **Documentação de Banco de Dados**
Esse documento pode descrever o esquema do banco de dados, as tabelas, relacionamentos e como as migrações são gerenciadas.

**Exemplo de conteúdo**:
```markdown
# Esquema do Banco de Dados

## Tabelas

### 1. Tabela `users`

- **Campos**:
  - `id` (integer, PK)
  - `name` (string)
  - `email` (string, único)

### 2. Tabela `emails_sent`

- **Campos**:
  - `id` (integer, PK)
  - `user_id` (integer, FK para `users`)
  - `subject` (string)
  - `message` (text)
  - `sent_at` (timestamp)

(Descrição sobre as migrações e como elas são aplicadas)
