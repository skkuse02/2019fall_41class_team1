const aa = require('express-async-await');
const express = require('express');

const router = aa(express.Router());

const {
  getMainDataAll,
  getMainRecent
} = require('./main');

router.get('/recent', getMainRecent);
router.get('/', getMainDataAll);

module.exports = router;
