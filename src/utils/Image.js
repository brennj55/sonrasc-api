var fs = require('fs');
var Q = require('q');
var fsWriteFile = Q.denodeify(fs.writeFile);

const saveBlobAsImage = (imageFromUser, filename) => {
  var regex = /^data:.+\/(.+);base64,(.*)$/;
  var matches = imageFromUser.match(regex);
  var ext = matches[1];
  var data = matches[2];
  var buffer = new Buffer(data, 'base64');
  console.log("Writing image...");
  return fsWriteFile('/src/images/' + filename + '.jpg', buffer);
};

export default {
  saveBlobAsImage
};
