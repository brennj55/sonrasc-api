'use strict';
var fs = require('fs');
var Q = require('q');
var fetch = require('node-fetch');

var request = Q.denodeify(require('request'));
var fsWriteFile = Q.denodeify(fs.writeFile)

let getImageContents = () => {
  var deferred = Q.defer();
  var data = {"img_url":"http://192.168.99.100:9005/data", "engine":"tesseract"};
  request({
    method: 'POST',
    url: 'http://192.168.99.100:9292/ocr',
    headers: {
      'Content-Type': 'application/json'
    },
    body: "{  \"img_url\": \"http://192.168.99.100:9005/data\",  \"engine\": \"tesseract\"}"
  }, (err, res, body) => {
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
  console.log("Writing image...");
  return fsWriteFile('images/data.jpg', buffer);
};

let createPOSTObject = (type, data) => {
  let trimmedData = data.trim();
  let objectType = type.toLowerCase();
  let dataObject = JSON.stringify({type: objectType, data: trimmedData});
  let url = 'http://192.168.99.100:9080/' + type;
  let toSend = {
    method: 'POST',
    body: dataObject,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  return {url, toSend};
};

let extractDataObject = (type, data) => {
  let httpPOST = createPOSTObject(type, data);
  return fetch(httpPOST.url, httpPOST.toSend)
    .then(res => res.json()).then(json => json.answer);
};

let extractText = (imageData) => processImage(imageData)
  .then(getImageContents).then(data => extractDataObject(imageData.cropType, data));

module.exports = {
  extractText: extractText
};
