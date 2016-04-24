'use strict';
var Q = require('q');
var ip = require('ip');
var fetch = require('node-fetch');
var request = Q.denodeify(require('request'));
import Image from './utils/Image';

const OPEN_OCR_IP = 'http://openocr:' + process.env.OPENOCR_1_PORT_9292_TCP_PORT +'/ocr';
const LANGUAGE_PROCESSING_IP = 'http://language-processing:' + process.env.LANGUAGE_PROCESSING_1_PORT_9080_TCP_PORT + '/';

let getImageContents = (id) => {
  var deferred = Q.defer();
  var IP_ADDRESS = "http://" + ip.address() + ":9005/api/images/" + id;
  var data = { img_url: IP_ADDRESS, engine: "tesseract" };

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

let extractText = (imgData, filename) => Image.saveBlobAsImage(imgData.imageData, filename)
  .then(() => getImageContents(filename))
  .then(data => extractDataObject(imgData.cropType, data));

module.exports = {
  extractText
};
