FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add curl && npm install

COPY . .
COPY .env .env

RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "prisma"]
