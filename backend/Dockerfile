FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add curl && npm install

COPY . .
COPY .env .env
RUN npx prisma generate

CMD ["npm", "start"]
