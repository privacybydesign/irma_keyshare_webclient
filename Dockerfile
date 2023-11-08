FROM node:21-alpine as build
WORKDIR /app
COPY . /app
RUN yarn install --immutable --immutable-cache --check-cache --silent
RUN yarn build --silent

FROM joseluisq/static-web-server:latest
COPY --from=build /app/build /public