const aa = require('express-async-await');
const express = require('express');

const router = aa(express.Router());

const {
  viewPage, modifyPage
} = require('./page');

router.get('/view/:title', viewPage);
router.post('/modify/:title', modifyPage);

module.exports = router;
