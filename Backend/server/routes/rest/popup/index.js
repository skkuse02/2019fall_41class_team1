const aa = require('express-async-await');
const express = require('express');
const upload = require('../../../config/upload.js');

const router = aa(express.Router());

const {
  getPopupList, viewPopup, addPopup, modifyPopup, deletePopup, downFile, getPopupMain
} = require('./popup');


router.get('/', getPopupList);
router.get('/main', getPopupMain);
router.get('/view/:id', viewPopup);
router.get('/file/download/:id', downFile);
router.post('/write', upload, addPopup);
router.post('/modify/:id', upload, modifyPopup);
router.post('/delete/:id', deletePopup);

module.exports = router;
