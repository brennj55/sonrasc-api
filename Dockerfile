FROM node:5.4.1

RUN apt-get install imagemagick
ADD package.json /tmp/package.json
RUN npm set progress=false
RUN cd /tmp && npm install
RUN mkdir -p /src && cp -a /tmp/node_modules /src
RUN npm install webpack -g \
                webpack-dev-server -g \
                gulp -g \
                nodemon -g
WORKDIR /src
EXPOSE 9005
