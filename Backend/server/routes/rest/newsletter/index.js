// newsletter index.js 입니다.
const aa = require('express-async-await');
const express = require('express');
const upload = require('../../../config/upload.js');

const router = aa(express.Router());

const {
  getNewsletter,
  viewNewsletter,
  writeNewsletter,
  modifyNewsletter,
  deleteNewsletterPost,
  retrieveNewsletter,
  downloadNewsletter,
  deleteNewsletterFile,
} = require('./newsletter');

router.get('/', getNewsletter);
router.get('/view/:id', viewNewsletter);
router.post('/write', upload, writeNewsletter);
router.post('/modify/:id', upload, modifyNewsletter);
router.post('/delete/:id', deleteNewsletterPost);
router.get('/getdata/:id', retrieveNewsletter);
router.get('/file/download/:id', downloadNewsletter);
router.post('/delete/file/:id', deleteNewsletterFile);

module.exports = router;
