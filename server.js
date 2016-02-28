var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8080, () => {
  console.log("Listening on port 8080 for data...");
});

io.on('connection', (socket) => {
  console.log("data recieved.");
});
