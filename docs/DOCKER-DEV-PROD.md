# Docker: Desenvolvimento vs Produção

## 📋 Índice

- [Diferenças Fundamentais](#diferenças-fundamentais)
- [Dockerfile Multi-Stage](#dockerfile-multi-stage)
- [Docker Compose Dev vs Prod](#docker-compose-dev-vs-prod)
- [Volumes: O Grande Diferencial](#volumes-o-grande-diferencial)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Comandos e Scripts](#comandos-e-scripts)
- [Boas Práticas](#boas-práticas)
- [Troubleshooting](#troubleshooting)

---

## Diferenças Fundamentais

### Desenvolvimento (Dev)

- **Objetivo**: Agilidade e feedback rápido
- **Hot Reload**: Código atualiza automaticamente
- **Volumes**: Monta código-fonte local no container
- **Logs**: Verbosos e detalhados
- **Otimização**: Não é prioridade
- **Debugging**: Ferramentas habilitadas

### Produção (Prod)

- **Objetivo**: Performance, estabilidade e segurança
- **Imutabilidade**: Código empacotado na imagem
- **Sem Volumes**: Apenas dados persistentes
- **Logs**: Estruturados e concisos
- **Otimização**: Build minificado, dependências reduzidas
- **Segurança**: Usuário não-root, secrets seguros

---

## Dockerfile Multi-Stage

### Estrutura Básica
```dockerfile
# Base compartilhada
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache ca-certificates openssl

# Instalação de dependências
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Stage de DESENVOLVIMENTO
FROM deps AS dev
ENV NODE_ENV=development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build para PRODUÇÃO
FROM deps AS build
COPY . .
RUN npm run build
RUN npm prune --omit=dev

# Runtime de PRODUÇÃO
FROM base AS prod
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
USER node
EXPOSE 3000
CMD ["npm", "run", "start"]
```

### Vantagens do Multi-Stage

✅ **Reutilização**: Stages compartilham camadas  
✅ **Otimização**: Imagem final contém apenas o necessário  
✅ **Flexibilidade**: Um Dockerfile para todos os ambientes  
✅ **Segurança**: Separação clara entre build e runtime  

---

## Docker Compose Dev vs Prod

### docker-compose.yml (Desenvolvimento)
```yaml
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: dev  # Stage de desenvolvimento
    container_name: my-app-dev
    env_file:
      - .env
    environment:
      NODE_ENV: development
      CHOKIDAR_USEPOLLING: true  # Para file watchers
    ports:
      - "3000:3000"
    volumes:
      - ./:/app  # ⚠️ Monta TODO o código local
      - node_modules:/app/node_modules  # Evita conflito
    command: npm run dev
    restart: unless-stopped

volumes:
  node_modules:
```

### docker-compose.prod.yml (Produção)
```yaml
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: prod  # Stage de produção
    container_name: my-app-prod
    env_file:
      - .env.production
    environment:
      NODE_ENV: production
    ports:
      - "3000:3000"
    # ✅ SEM volumes de código fonte!
    command: npm run start
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

---

## Volumes: O Grande Diferencial

### Em Desenvolvimento
```yaml
volumes:
  - ./:/app  # Bind mount - reflete mudanças em tempo real
  - node_modules:/app/node_modules  # Named volume
```

**Como funciona:**
1. Você edita `src/controller.ts` localmente
2. O arquivo é **instantaneamente** atualizado no container
3. O file watcher (nodemon, tsx watch) detecta a mudança
4. A aplicação reinicia automaticamente

**Vantagens:**
- Hot reload
- Não precisa rebuild
- Debug facilitado

**Desvantagens:**
- Performance (I/O)
- Inconsistências entre OS (Windows/Linux)

### Em Produção
```yaml
# SEM volumes de código!
# Código está "empacotado" na imagem Docker
```

**Como funciona:**
1. `docker build` copia o código para a imagem
2. A imagem é imutável
3. Deploy = substituir container por nova versão da imagem

**Vantagens:**
- Performance máxima
- Consistência garantida
- Portabilidade total

---

## Variáveis de Ambiente

### .env (Desenvolvimento)
```env
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/dev_db

# Logs verbosos
LOG_LEVEL=debug

# CORS permissivo
CORS_ORIGIN=*

# Cookies inseguros (HTTP)
COOKIE_SECURE=false
COOKIE_SAMESITE=lax

# Hot reload
CHOKIDAR_USEPOLLING=true
```

### .env.production (Produção)
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db-prod:5432/prod_db

# Logs otimizados
LOG_LEVEL=warn

# CORS restrito
CORS_ORIGIN=https://meuapp.com

# Cookies seguros (HTTPS)
COOKIE_SECURE=true
COOKIE_SAMESITE=strict

# Proxy reverso (nginx/cloudflare)
TRUST_PROXY=1

# Monitoring
SENTRY_DSN=https://...
SENTRY_TRACES_SAMPLE_RATE=0.1
```

---

## Comandos e Scripts

### package.json
```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc && tsc-alias",
    "start": "node dist/server.js",
    "test": "jest",
    "lint": "eslint ."
  }
}
```

### Comandos Docker
```bash
# DESENVOLVIMENTO
docker-compose up --build
docker-compose logs -f
docker-compose exec api npm run test

# PRODUÇÃO
docker-compose -f docker-compose.prod.yml up --build -d
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml restart api

# Rebuild completo
docker-compose -f docker-compose.prod.yml up --build --force-recreate -d
```

---

## Boas Práticas

### ✅ Desenvolvimento

1. **Use volumes para código fonte**
```yaml
   volumes:
     - ./:/app
```

2. **Mantenha node_modules isolado**
```yaml
   volumes:
     - node_modules:/app/node_modules
```

3. **Logs detalhados**
```typescript
   logger.level = 'debug'
```

4. **Hot reload configurado**
```json
   "dev": "tsx watch src/server.ts"
```

5. **Dados de teste/seed**
```bash
   npm run db:seed
```

### ✅ Produção

1. **NÃO use volumes para código**
```yaml
   # ❌ Nunca faça isso em prod:
   # volumes:
   #   - ./:/app
```

2. **Build otimizado**
```dockerfile
   RUN npm ci --only=production
   RUN npm run build
```

3. **Usuário não-root**
```dockerfile
   USER node
```

4. **Healthchecks**
```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
     interval: 30s
```

5. **Limites de recursos**
```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 512M
```

6. **Secrets seguros**
```bash
   # Use Docker secrets, não .env files
   docker secret create db_password ./db_password.txt
```

---

## Troubleshooting

### Problema: Mudanças não aparecem no dev

**Causa:** Volume não está montado corretamente

**Solução:**
```bash
# Verifique os volumes
docker inspect <container> | grep Mounts -A 20

# Deve aparecer algo como:
# "Source": "/caminho/local/app",
# "Destination": "/app"
```

### Problema: Hot reload não funciona

**Causa:** File watcher não detecta mudanças (comum no Windows/WSL)

**Solução:**
```yaml
environment:
  CHOKIDAR_USEPOLLING: true  # Força polling mode
```

Ou use `nodemon.json`:
```json
{
  "legacyWatch": true,
  "polling": true
}
```

### Problema: "Cannot find module" após mudanças

**Causa:** node_modules local conflita com do container

**Solução:**
```yaml
volumes:
  - ./:/app
  - node_modules:/app/node_modules  # Isola node_modules
```

### Problema: Prod ainda reflete mudanças locais

**Causa:** Usando arquivo errado ou volumes montados

**Solução:**
```bash
# Certifique-se de usar o arquivo prod
docker-compose -f docker-compose.prod.yml up

# Verifique se NÃO há volumes de código
docker-compose -f docker-compose.prod.yml config | grep volumes
```

### Problema: Imagem muito grande

**Causa:** DevDependencies na imagem final

**Solução:**
```dockerfile
# No stage de build
RUN npm prune --omit=dev

# Ou use .dockerignore
node_modules
.git
.env*
*.md
tests/
```

### Problema: Build lento

**Solução:**
```dockerfile
# Copie package.json ANTES do código
COPY package*.json ./
RUN npm ci

# Cache de layers é reutilizado se package.json não mudar
COPY . .
```

---

## Comparação Lado a Lado

| Aspecto | Desenvolvimento | Produção |
|---------|----------------|----------|
| **Stage** | `dev` | `prod` |
| **Volumes** | Código montado (`./:/app`) | Sem volumes |
| **Hot Reload** | ✅ Sim | ❌ Não |
| **Build** | Não otimizado | Minificado, tree-shaken |
| **Dependencies** | All (dev + prod) | Apenas prod |
| **Logs** | Verbose/Debug | Warn/Error |
| **User** | root (ou qualquer) | `node` (não-root) |
| **Env File** | `.env` | `.env.production` |
| **Command** | `npm run dev` | `npm run start` |
| **Segurança** | Relaxada | Restrita |
| **CORS** | `*` | Domínio específico |
| **Cookies** | `secure: false` | `secure: true` |

---

## Exemplo Completo: Fluxo de Trabalho

### 1. Desenvolvimento Local
```bash
# Sobe ambiente de dev
docker-compose up

# Edita código localmente
vim src/controller.ts

# Hot reload detecta e reinicia automaticamente
# Testa mudanças instantaneamente
```

### 2. Preparando para Produção
```bash
# Testa build de produção localmente
docker-compose -f docker-compose.prod.yml build

# Testa a imagem
docker-compose -f docker-compose.prod.yml up

# Valida que mudanças locais NÃO refletem
vim src/controller.ts  # Container não muda!
```

### 3. Deploy
```bash
# Build e tag da imagem
docker build -t myapp:1.0.0 --target prod .

# Push para registry
docker push myapp:1.0.0

# No servidor de produção
docker pull myapp:1.0.0
docker-compose -f docker-compose.prod.yml up -d
```

---

## Recursos Adicionais

- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [12 Factor App](https://12factor.net/)

---

**Resumo**: A principal diferença entre dev e prod no Docker é que **desenvolvimento usa volumes para hot reload** enquanto **produção empacota código na imagem para imutabilidade**. Use multi-stage builds para gerenciar ambos os ambientes eficientemente! 🐳