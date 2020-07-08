FROM node:12-slim

ADD server.js /app/
ADD package* /app/
WORKDIR app/
RUN npm install

CMD npm start
