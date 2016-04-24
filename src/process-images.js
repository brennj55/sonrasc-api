'use strict';
var Q = require('q');
var ip = require('ip');
var fetch = require('node-fetch');
import Image from './utils/Image';


const LANGUAGE_PROCESSING_IP = 'http://language-processing:' + process.env.LANGUAGE_PROCESSING_1_PORT_9080_TCP_PORT + '/';

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

let extractText = (imgData, filename) => {
  return Image.saveBlobAsImage(imgData.imageData, filename)
  .then(() => Image.getImageContents(filename))
  .then(data => extractDataObject(imgData.cropType, data))
};

module.exports = {
  extractText
};
