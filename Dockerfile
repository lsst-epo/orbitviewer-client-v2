FROM node:26.12.1-alpine AS builder

WORKDIR /app
COPY . /app

RUN yarn && yarn build

FROM node:26.12.1-alpine AS runner

WORKDIR /app

COPY --from=builder --exclude=.env /app .

EXPOSE 8080

CMD ["yarn", "start"]