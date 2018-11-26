FROM node:8-alpine
RUN apk update && apk add python make g++ git

RUN mkdir -p /usr/app \
    && npm i -g nodemon

WORKDIR /usr/app
VOLUME ["/usr/app"]