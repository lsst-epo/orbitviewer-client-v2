FROM node:22-alpine AS builder

WORKDIR /app
COPY . /app

RUN yarn && yarn build

FROM builder AS runner

COPY --from=builder --exclude=.env /app .

EXPOSE 8080

CMD ["yarn", "start"]