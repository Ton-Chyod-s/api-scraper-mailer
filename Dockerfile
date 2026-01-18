# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps

COPY package.json package-lock.json ./

RUN npm ci

# NÃO gera Prisma aqui

FROM deps AS dev

ENV NODE_ENV=development

COPY . .

USER node

EXPOSE 3000

# Gera Prisma no runtime
CMD ["sh", "-c", "npx prisma generate && npm run dev"]

# ----------------------
# build
# ----------------------
FROM deps AS build

COPY . .

# Define DATABASE_URL fake
ENV DATABASE_URL="postgresql://fake:fake@localhost:5432/fake?schema=public"

# Gera Prisma antes de buildar
RUN npx prisma generate

RUN npm run build

# Prune devDependencies
RUN npm prune --omit=dev

# ----------------------
# prod
# ----------------------
FROM base AS prod

ENV NODE_ENV=production

COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma

# Necessário para prisma.config.js funcionar com migrations
COPY --from=build --chown=node:node /app/prisma.config.js ./

USER node

EXPOSE 3000

CMD ["node", "dist/main/server.js"]