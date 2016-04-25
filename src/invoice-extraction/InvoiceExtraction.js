let bcrypt = require('bcrypt-nodejs');
let ImgCrop = require('easyimage');
import Image from '../utils/Image';
const Q = require('q');
var deep = require("q-deep");
import _ from 'lodash';
import { extractDataObject } from '../process-images';

const extractInfoFromInvoice = (req, res) => {
  let filename = getHashedFileName();
  let imageData = req.body.image;
  const objectsToExtract = getBoundaryDataFromInvoices(req.body.invoices);
  return Image.saveBlobAsImage(imageData, filename)
    .then(() => cropAllImageParts(objectsToExtract, filename))
    .then(() => extractAllCroppedImages(objectsToExtract))
    .then((data) => assoicateExtractedDataWithObjects(data, objectsToExtract))
    .then(data => _.groupBy(data, 'type'))
    .then(groups => getFrequentCroppings(groups))
    .then(counts => parseCandidates(counts))
    .then(data => res.json({data}));
}

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
     y: boundary.top,
    gravity: "NorthWest"
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
  boundaryObjects = boundaryObjects.filter(object => !_.isEmpty(object.boundary));
  console.log(boundaryObjects);
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
  return _.zipWith(data, objs, (text, obj) => {
    return Object.assign({}, obj, { text });
  });
}

function parseCandidates(groups) {
  let valuesWithContent = groups.map(group => Object.assign({}, group, { count: _.filter(group.count, count => count.countCandidate !== '' || count.countCandidate !== null)}));
  let x = valuesWithContent.map(invoicePart => {
    let promise = invoicePart.count.map(candidate => extractDataObject(invoicePart.type, candidate.countCandidate));
    let object = Object.assign({}, invoicePart, { count: promise });
    return Q.all(object);
  });
  return deep(x);
}

function getFrequentCroppings(data) {
  let getCountObjects = (count) => _.map(_.keys(count), countCandidate => { return {countCandidate, count: count[countCandidate] }});
  let counts = _.map(data, (values, key) => {
    let count = _.countBy(values, 'text');
    return { type: key, count: getCountObjects(count) };
  });
  return counts;
}

function filterParsedData(data) {
  return data.map(y => Object.assign({}, y, { count: y.count.filter(x => x !== null) }));
}

export default { extractInfoFromInvoice };
