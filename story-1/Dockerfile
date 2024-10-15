FROM node:8.9.4-stretch AS build

WORKDIR /tmp

COPY package.json .
COPY package-lock.json .

RUN npm install

FROM node:8.9.4-stretch

WORKDIR /tmp


ENV UV_THREADPOOL_SIZE=4

COPY --from=build /tmp/node_modules ./node_modules
COPY server-1.js .

CMD ["node"]
