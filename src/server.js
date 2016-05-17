var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
let fileID = 0;
import Image from './utils/Image';

import InvoiceExtraction from './invoice-extraction/InvoiceExtraction';

let bodyParser = require('body-parser');
app.use(bodyParser({limit: '100mb'}));
app.use(bodyParser.json({ limit: '100mb' }));

var processing = require('./process-images.js');
let router = express.Router();

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "Content-type,Accept,X-Custom-Header");
  if ('OPTIONS' == req.method) {
       res.sendStatus(200);
   } else {
       next();
   }
});

router.route('/invoiceGuess')
  .post(InvoiceExtraction.extractInfoFromInvoice);

server.listen(9005, () => {
  console.log("Listening on port 9005 for data..!");
});

const getContents = (imgData, socket) => {
    fileID += 1;
    let currentFileID = fileID;
    processing.extractText(imgData, currentFileID)
      .then(data => {
        socket.emit('extracted-text', data)
      })
      .then(() => Image.deleteFile(currentFileID));
};

io.on('connection', (socket) => {
  console.log("User connected.");
  socket.on('image-cropping', imgData => {
    getContents(imgData, socket);
  });
});

router.route('/images/:id')
  .get((req, res) => {
  let id = req.params.id;
  return res.sendFile("/src/images/" + id + ".jpg");
});


app.use('/api', router);
