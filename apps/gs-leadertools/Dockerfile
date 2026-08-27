FROM node:22-alpine AS base

RUN apk add curl

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

ARG ENV
ENV ENV=$ENV

RUN yarn build

RUN rm -f .env.dev .env.uat .env.uat2 .env.ue.dev .env.ue.local

ENV NODE_ENV=production
ENV PORT=80

ARG GIT_COMMIT
ENV GIT_COMMIT=$GIT_COMMIT

EXPOSE 80


CMD ["yarn", "start"]