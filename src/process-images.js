'use strict';
var fs = require('fs');
var Q = require('q');

var request = Q.denodeify(require('request'));
var fsWriteFile = Q.denodeify(fs.writeFile)

const REQUEST_TO_OCR_API = {
  method: 'POST',
  url: 'http://192.168.99.100:9292/ocr',
  headers: {
    'Content-Type': 'application/json'
  },
  body: "{  \"img_url\": \"http://192.168.99.100:9005/data\",  \"engine\": \"tesseract\"}"
};

let getImageContents = () => {
  var deferred = Q.defer();
  request(REQUEST_TO_OCR_API, (err, res, body) => {
    deferred.resolve(body);
  });
  return deferred.promise;
};

let processImage = (imageFromUser) => {
  var image = imageFromUser.imageData;
  var regex = /^data:.+\/(.+);base64,(.*)$/;
  var matches = image.match(regex);
  var ext = matches[1];
  var data = matches[2];
  var buffer = new Buffer(data, 'base64');
  return fsWriteFile('images/data.jpg', buffer);
};

let extractText = (imageData) => processImage(imageData)
  .then(getImageContents);

module.exports = {
  extractText: extractText
};
