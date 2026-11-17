FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install --omit=dev

COPY server.js ./
COPY lib ./lib
COPY app ./app
COPY design ./design

EXPOSE 3000

CMD ["node", "server.js"]
