let bcrypt = require('bcrypt-nodejs');
let ImgCrop = require('easyimage');
import Image from '../utils/Image';
const Q = require('q');
import { isEmpty, zipWith, zipObject,
  groupBy, countBy, map, keys } from 'lodash';

const extractInfoFromInvoice = (req, res) => {
  let filename = getHashedFileName();
  //let outputFilename = getHashedFileName();
  let imageData = req.body.image;

  const objectsToExtract = getBoundaryDataFromInvoices(req.body.invoices);

  Image.saveBlobAsImage(imageData, filename)
    .then(() => cropAllImageParts(objectsToExtract, filename))
    .then(() => extractAllCroppedImages(objectsToExtract))
    .then((data) => assoicateExtractedDataWithObjects(data, objectsToExtract))
    .then(x => groupBy(x, 'type'))
    .then(ys => getFrequentCroppings(ys));

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


//get this directly from the db instead?
const getBoundaryDataFromInvoices = (invoices) => {
  let types = ['Name', 'Price', 'Quantity'];
  let boundaryObjects = [];
  invoices.map(invoice => {
    let dateBoundary = {
      type: 'date',
      boundary: getBoundaryObject(invoice.date.boundary),
      filename: getHashedFileName()
    };

    boundaryObjects.push(dateBoundary);
    invoice.items.map((item, index) => {

      types.map(type => boundaryObjects.push({
        type: 'item/' + index + '/' + type.toLowerCase(),
        boundary: getBoundaryObject(item[type].boundary),
        filename: getHashedFileName()
      }));

    });
  });
  boundaryObjects = boundaryObjects.filter(object => !isEmpty(object.boundary));
  return boundaryObjects;
}

const getBoundaryObject = (boundary) => {
  if (!boundary) return {};
  return {
    top: boundary.top,
    left: boundary.left,
    width: boundary.width,
    height: boundary.height
  };
}

function cropAllImageParts(arr, filename) {
  var promises = arr.map((el) => cropImage(filename, el.filename, el.boundary));
  return Q.all(promises);
}

function extractAllCroppedImages(arr) {
  var promises = arr.map((obj) => Image.getImageContents(obj.filename));
  return Q.all(promises);
}

function assoicateExtractedDataWithObjects(data, objs) {
  return zipWith(data, objs, (text, obj) => {
    return Object.assign({}, obj, { text });
  });
}

function getFrequentCroppings(data) {
  let keys = keys(data);
  let counts = map(data, x => countBy(x, 'text'));
  // console.log(keys, counts);
  console.log(counts);
}

export default { extractInfoFromInvoice };
