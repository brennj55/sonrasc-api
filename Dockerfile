FROM node:5.4.1
RUN mkdir /src/
COPY ./ /src/
RUN mkdir /src/node_modules && ln -s /src/node_modules /src/node_modules && cd /src && npm install

WORKDIR /src
EXPOSE 9005
