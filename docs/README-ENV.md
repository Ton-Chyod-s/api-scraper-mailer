# 📝 Guia de Configuração de Ambientes

## 🎯 Estrutura de Arquivos

```
projeto/
├── .env.example          # Template documentado
├── .env.development      # Configurações de desenvolvimento
├── .env.production       # Configurações de produção
├── .gitignore            # Ignora .env.development e .env.production
└── src/
    └── config/
        └── load-env.ts   # Carrega o .env correto automaticamente
```

## 🚀 Como Usar

### 1. Primeira Configuração (Clone do Projeto)

```bash
# Copie o template para criar seus arquivos de ambiente
cp .env.example .env.development
cp .env.example .env.production

# Edite os arquivos com suas credenciais
vim .env.development
vim .env.production
```

### 2. Atualizar Imports

**ANTES** (antigo):
```typescript
import 'dotenv/config';
```

**DEPOIS** (novo):
```typescript
import '@config/load-env';
```

### 3. Scripts do package.json

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx watch src/server.ts",
    "build": "tsc",
    "start": "NODE_ENV=production node dist/server.js",
    "prisma:dev": "NODE_ENV=development prisma studio",
    "prisma:migrate": "NODE_ENV=development prisma migrate dev",
    "prisma:generate": "prisma generate"
  }
}
```

### 4. Docker Compose

**desenvolvimento (docker-compose.dev.yml)**:
```yaml
services:
  app:
    build: .
    environment:
      - NODE_ENV=development
    env_file:
      - .env.development
    volumes:
      - .:/app
```

**produção (docker-compose.yml)**:
```yaml
services:
  app:
    build: .
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
```

## 🔐 Segurança

### ✅ O QUE COMMITAR

- ✅ `.env.example` - Template sem dados sensíveis
- ✅ `src/config/load-env.ts` - Código de carregamento
- ✅ `.gitignore` - Configurado para ignorar .env reais

### ❌ NUNCA COMMITAR

- ❌ `.env.development` - Contém senhas e tokens
- ❌ `.env.production` - Contém credenciais de produção
- ❌ `.env` - Qualquer arquivo com dados reais

## 📊 Diferenças Entre Ambientes

| Configuração | Development | Production |
|--------------|-------------|------------|
| `NODE_ENV` | development | production |
| `DATABASE_URL` | localhost:5432 | nome-servico-docker:5432 |
| `JWT_EXPIRES_IN` | 7d | 1d |
| `COOKIE_SECURE` | false | true |
| `COOKIE_SAMESITE` | lax | strict |
| `TRUST_PROXY` | 0 | 1 |
| `SENTRY_TRACES_SAMPLE_RATE` | 0 | 0.1 |
| `PRISMA_QUERY_LOG` | true | false |
| `DEBUG_ROUTES_ENABLED` | true | false |
| `DIOGRANDE_DEBUG` | true | false |
| `DIOGRANDE_ALLOW_INSECURE_TLS` | true | false |
| `OFFICIAL_JOURNALS_DEBUG` | true | false |

## 🔧 Troubleshooting

### Erro: "Arquivo .env.development não encontrado"

```bash
# Crie o arquivo a partir do template
cp .env.example .env.development

# OU use .env genérico como fallback
cp .env.example .env
```

### Banco de dados não conecta

**Development:**
```bash
# Certifique-se que o host é localhost
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

**Production:**
```bash
# Use o nome do serviço Docker
DATABASE_URL=postgresql://user:pass@postgres-service:5432/db
```

### Variáveis não estão sendo carregadas

1. Verifique se o import está correto:
```typescript
import '@config/load-env'; // ✅
import 'dotenv/config';     // ❌ antigo
```

2. Verifique se o `NODE_ENV` está definido:
```bash
echo $NODE_ENV
```

3. Force o ambiente:
```bash
NODE_ENV=development npm run dev
```

## 📝 Checklist de Deploy

Antes de fazer deploy para produção:

- [ ] `.env.production` criado e configurado
- [ ] `COOKIE_SECURE=true`
- [ ] `COOKIE_SAMESITE=strict`
- [ ] `CORS_ORIGIN` configurado com domínio real
- [ ] `DATABASE_URL` apontando para banco de produção
- [ ] `SENTRY_DSN` configurado (se usar)
- [ ] `DIOGRANDE_ALLOW_INSECURE_TLS` removido ou `false`
- [ ] `DEBUG_ROUTES_ENABLED=false`
- [ ] `PRISMA_QUERY_LOG=false`
- [ ] Senhas fortes em `SEED_ADMIN_PASSWORD` e `POSTGRES_PASSWORD`
- [ ] `KEY_JWT` diferente do desenvolvimento

## 🎓 Boas Práticas

1. **Nunca** compartilhe arquivos `.env` no Slack/Discord/Email
2. Use gerenciadores de senhas para armazenar credenciais
3. Rotacione senhas regularmente (JWT_KEY, DB_PASSWORD, etc)
4. Em produção, use secrets do Docker/Kubernetes quando possível
5. Documente novas variáveis no `.env.example`
6. Mantenha `.env.development` com valores que funcionem localmente