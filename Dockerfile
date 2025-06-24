FROM node:22-alpine

WORKDIR /app
COPY . /app

RUN yarn && yarn build

EXPOSE 8080

CMD ["yarn", "start"]