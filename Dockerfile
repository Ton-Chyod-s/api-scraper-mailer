FROM node:20-alpine

WORKDIR /api

COPY package*.json ./
COPY prisma ./prisma

RUN npm install && npx prisma generate

RUN apk add --no-cache bash

COPY . .    

COPY wait-for-it.sh ./wait-for-it.sh
RUN chmod +x ./wait-for-it.sh

EXPOSE ${PORT}

CMD ["./wait-for-it.sh", "db:5432", "--", "npm", "start"]
