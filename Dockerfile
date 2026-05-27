FROM node:24-alpine AS build
WORKDIR /app
# Silence DEP0169 (legacy url.parse) — emitted by yarn 1.22's GitResolver on
# every install. Yarn 1 is in maintenance mode and won't fix it upstream;
# drop this line when migrating to Yarn Berry or npm.
ENV NODE_OPTIONS=--disable-warning=DEP0169
COPY . /app
RUN yarn install --immutable --immutable-cache --check-cache
RUN yarn build

FROM joseluisq/static-web-server:latest
COPY --from=build /app/build /public
