const fs = require('fs');
const Q = require('q');
const ip = require('ip');
const fsWriteFile = Q.denodeify(fs.writeFile);
const fsDeleteFile = Q.denodeify(fs.unlink);
const request = Q.denodeify(require('request'));

const saveBlobAsImage = (imageFromUser, filename) => {
  console.log('saving image?', filename);
  console.log(imageFromUser.substr(0, 300));
  let data = imageFromUser.replace(/^data:image\/png;base64,/, '');
  data = data.replace(/^data:image\/jpeg;base64,/, '');
  const buffer = new Buffer(data, 'base64');
  console.log("Writing image...");
  return fsWriteFile('/src/images/' + filename + '.jpg', buffer);
};

const deleteFile = (filename) => {
  console.log('look where i am', filename);
  return fsDeleteFile('/src/images/' + filename + '.jpg');
}

const getImageContents = (id) => {
  const deferred = Q.defer();
  const IP_ADDRESS = "http://" + ip.address() + ":9005/api/images/" + id;
  const OPEN_OCR_IP = 'http://openocr:' + process.env.OPENOCR_1_PORT_9292_TCP_PORT +'/ocr';
  const data = { img_url: IP_ADDRESS, engine: "tesseract" };

  console.log('hi?', id);
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

export default {
  saveBlobAsImage,
  getImageContents,
  deleteFile
};
