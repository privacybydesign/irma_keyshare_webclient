FROM node:24-alpine as build
WORKDIR /app
COPY . /app
RUN yarn install --immutable --immutable-cache --check-cache
RUN yarn build

FROM joseluisq/static-web-server:latest
COPY --from=build /app/build /public
