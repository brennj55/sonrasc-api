'use strict';

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var processing = require('./src/process-images.js');

server.listen(9005, () => {
  console.log("Listening on port 9005 for data...");
});

io.on('connection', (socket) => {
  console.log("User connected.");

  socket.on('image-cropping', imgData => {
    processing.extractText(imgData).then(data => {
      socket.emit('extracted-text', data);
    });
  });
});

app.get('/data', function (req, res) {
  res.sendFile("/src/images/data.jpg");
});
