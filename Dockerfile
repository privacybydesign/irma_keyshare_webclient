FROM node:24-alpine AS build
WORKDIR /app
# Enable corepack so the yarn version pinned in package.json's packageManager
# field (currently 4.x via .yarn/releases) is used instead of any classic
# yarn binary that might ship in the base image.
RUN corepack enable
COPY . /app
RUN yarn install --immutable
RUN yarn build

FROM joseluisq/static-web-server:latest
COPY --from=build /app/build /public
