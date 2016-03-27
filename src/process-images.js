'use strict';
var fs = require('fs');
var Q = require('q');
var ip = require('ip');
var fetch = require('node-fetch');
var request = Q.denodeify(require('request'));
var fsWriteFile = Q.denodeify(fs.writeFile);

const OPEN_OCR_IP = 'http://openocr:' + process.env.OPENOCR_1_PORT_9292_TCP_PORT +'/ocr';
const LANGUAGE_PROCESSING_IP = 'http://language-processing:' + process.env.LANGUAGE_PROCESSING_1_PORT_9080_TCP_PORT + '/';

let getImageContents = () => {
  var deferred = Q.defer();
  var IP_ADDRESS = "http://" + ip.address() + ":9005/data";
  var data = {img_url: IP_ADDRESS, engine:"tesseract"};

  request({
    method: 'POST',
    url: OPEN_OCR_IP,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
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
  let url = LANGUAGE_PROCESSING_IP + type;
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
  .then(getImageContents)
  .then(data => extractDataObject(imageData.cropType, data));

module.exports = {
  extractText
};
