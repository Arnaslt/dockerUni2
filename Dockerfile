FROM node:8

WORKDIR /app

COPY . /app

RUN npm install

CMD node server.js

EXPOSE 3001