var express = require('express');
var router = express.Router();
const multer = require('multer');
const Grid = require('gridfs-stream');
const GridFsStorage = require('multer-gridfs-storage');
var Verify = require('./verify'); //module to manage JWTs and verify user's idemtities through tokens
const config = require('../config');
const crypto = require('crypto');
const mongoose = require('mongoose');
const fileType = require('file-type');
const path = require('path');

//Initiating connection to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUrl);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  //We are connected!
  console.log("Connected correctly to server");
})


// Init gfs
let gfs;
db.once('open', () => {
  // Init stream
  gfs = Grid(db.db, mongoose.mongo);
  gfs.collection('uploads');
  module.export = gfs;
});
const filePath = path.resolve(__dirname,'../public');
// Create storage engine
const storage = new GridFsStorage({
  url: config.mongoUrl,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(10, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const originalname = file.originalname;

        const filename = originalname.split('.')[0] + '_' + buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
var upload = multer({ //multer settings
  storage: storage
}).single('file');


router.post('/upload', Verify.verifyOrdinaryUser, Verify.verifyAdmin, (req, res) => {
  // res.json({ file: req.file });
  upload(req, res, function(err) {
    if(err) {
      console.log("Error is: " + err);
      res.status(500).json({ error: 'Unable to load file' });
    }
    else {
      console.log('No Error');
      res.status(200).json({ error: 'File Successfully uploaded' });
    }
  });
});
//
router.get('/download/:filename', Verify.verifyOrdinaryUser, (req, res) => {
  console.log('File name is: ' + req.params.filename);
  gfs.files.findOne({filename: req.params.filename}, (err, file) =>  {
    if(file.length === 0 || !file) {
      return res.status(400).send({ message: 'File not found' });
    }
    console.log(file);
    let data = [];
    let readstream = gfs.createReadStream({
      filename: file.filename
    });
    readstream.on('data', (chunk) => {
      data.push(chunk);
    });
    readstream.on('end', () => {
      data = Buffer.concat(data);

      let type = fileType.fromBuffer(data);
      res.writeHead(200, {
        'Content-Type': file.contentType,
        'Content-disposition': 'attachment; filename=' + file.filename + '.' + file.filename.split('.')[1],
        'Content-Length': file.length
      });
      res.end(data);
    });
    readstream.on('error', (err) => {
      logger.error(`[*] Error, while downloading a file, with error:  ${err}`);
      res.status(400).send({
        message: `Error, while downloading a file, with error:  ${err}`
      });
    });
  })
});

router.get('/', Verify.verifyOrdinaryUser, (req, res) => {
  
  gfs.files.find().toArray((err, files) => {
    if(err) {
      return res.status(404).json({err: 'Something bad happened'});
    }
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }
    // Files exist
    return res.json(files);
  });
});
module.exports = router;
