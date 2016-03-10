FROM node:5.4.1
RUN mkdir /src/
COPY ./ /src/
RUN mkdir /src/node_modules && ln -s /src/node_modules /src/node_modules && cd /src && npm install
RUN npm install webpack -g \
                webpack-dev-server -g \
                gulp -g

WORKDIR /src
EXPOSE 9005
