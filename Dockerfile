FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY server.js ./
COPY app ./app
COPY design ./design

EXPOSE 3000

CMD ["node", "server.js"]
