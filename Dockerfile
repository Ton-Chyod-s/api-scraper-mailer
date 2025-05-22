FROM node:22.14.0

WORKDIR /api

COPY package*.json prisma ./

RUN npm cache clean --force && npm install --legacy-peer-deps

RUN npm install -g cross-env

RUN npx prisma generate

COPY . .

COPY wait-for-it.sh /usr/local/bin/wait-for-it

RUN sed -i 's/\r$//' /usr/local/bin/wait-for-it

RUN chmod +x /usr/local/bin/wait-for-it

RUN npm run build

EXPOSE 5050

CMD ["npm", "run", "start"]
