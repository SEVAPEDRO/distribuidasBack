var express = require('express');
var router = express.Router();
var UploadController = require('../../controllers/upload.controller');
var Authorization = require('../../auth/authorization');

/* GET utils listing. */
router.get('/', function(req, res, next) {
  res.send('Utils listing');
});

router.post('/',Authorization, UploadController.uploadFilesImgUser);

module.exports = router;
