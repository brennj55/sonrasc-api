'use strict';

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');

server.listen(9005, () => {
  console.log("Listening on port 9005 for data..!!.");
});

io.on('connection', (socket) => {
  console.log("User connected.");

  socket.on('image-cropping', processImage);
});

let processImage = (imageFromUser) => {
  var image = imageFromUser.imageData;
  var regex = /^data:.+\/(.+);base64,(.*)$/;
  var matches = image.match(regex);
  var ext = matches[1];
  var data = matches[2];
  var buffer = new Buffer(data, 'base64');
  fs.writeFile('images/data.jpg', buffer, () => {
    var files = fs.readdirSync('images');
    console.log(files);
    fs.stat('images/data.jpg', (err, stat) => {
      if (err === null) {
        console.log('file is here...!');
      }
    });
  });
};

app.get('/data', function (req, res) {
  var files = fs.readdirSync('.');
  console.log(files);
  console.log(__dirname);
  fs.stat('images/data.jpg', (err, stat) => {
    if (err === null) {
      console.log('file is here...!');
    }
  });
  res.sendFile("/src/images/data.jpg");
});
