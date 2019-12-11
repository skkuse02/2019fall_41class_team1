const aa = require('express-async-await');
const express = require('express');
const upload = require('../../../config/upload.js');

const router = aa(express.Router());

const {
  deleteFile,
  deleteAd,
  modifyAd,
  viewAd,
  writeAd,
  getAds
} = require('./administration');

router.get('/list', getAds);
router.post('/write', upload, writeAd);
router.get('/view/:id', viewAd);
router.post('/modify/:id', upload, modifyAd);
router.post('/delete/:id', deleteAd);
router.post('/file/delete/:id', deleteFile);

module.exports = router;
