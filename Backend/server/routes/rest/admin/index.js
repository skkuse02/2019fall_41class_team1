const aa = require('express-async-await');
const express = require('express');

const router = aa(express.Router());

const {
  loginUser, logoutUser
} = require('./admin');

router.post('/login', loginUser);
router.post('/logout', logoutUser);

module.exports = router;
