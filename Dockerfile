FROM node:26.12.1-alpine AS builder

WORKDIR /app
COPY . /app

RUN npm install -g corepack && corepack enable

RUN yarn && yarn build

EXPOSE 8080

CMD ["yarn", "start"]