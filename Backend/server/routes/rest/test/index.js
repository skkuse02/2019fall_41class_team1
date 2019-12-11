const aa = require('express-async-await');
const express = require('express');

const router = aa(express.Router());

const {
  tt,
} = require('./test');

router.get('/', tt);

module.exports = router;
