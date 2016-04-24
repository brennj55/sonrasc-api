let bcrypt = require('bcrypt-nodejs');
let ImgCrop = require('easyimage');
import Image from '../utils/Image';

const extractInfoFromInvoice = (req, res) => {
  let filename = getHashedFileName();
  //let outputFilename = getHashedFileName();
  let imageData = req.body.image;

  const objectsToExtract = getBoundaryDataFromInvoices(req.body.invoices);

  // Image.saveBlobAsImage(imageData, filename)
  //   .then(() => cropImage(filename, outputFilename, date.boundary))
  //   .then(() => Image.getImageContents(outputFilename))
  //   .then(data => console.log(data, data.length));


  //Image.saveBlobAsImage(imageData, filename).then();
  //set up boundaries
    //one for data
    //put all in a set.
  //for each boundary
    //cut the image and send to processing server.
    //check the text.
    //if its new, insert into data strcuture.
    //else increase counter of existing candidate
  //return the highest occuring candidate.
  //saveImage(req.body.image);
}

// boundaries = {type: date, boundary: object, filename: string }

const getHashedFileName = () => {
  let filename = bcrypt.hashSync(Math.random() + ' ' + new Date().toString(), bcrypt.genSaltSync(8), null);
  filename = filename.replace(/\W/g, '')
  return filename;
}

const cropImage = (sourceFileName, outputFilename, boundary) => {
  console.log('cropping?', outputFilename);
  return ImgCrop.crop({
     src: '/src/images/' + sourceFileName + '.jpg',
     dst: '/src/images/' + outputFilename + '.jpg',
     cropwidth: boundary.width,
     cropheight: boundary.height,
     x: boundary.left,
     y: boundary.top
  }).then((image) => console.log('Resized and cropped: ' + image.width + ' x ' + image.height),
          (err) => console.log(err));
};


const getBoundaryDataFromInvoices = (invoices) => {
  console.log(invoices);
}

export default { extractInfoFromInvoice };
