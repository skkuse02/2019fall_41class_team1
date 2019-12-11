const aa = require('express-async-await');
const express = require('express');

const router = aa(express.Router());

const {
  getCalendarData, deleteCalendarData, addCalendarData, modifyCalendarData, crawlingCalendarData,
} = require('./calendar');


router.get('/', getCalendarData);
router.post('/delete/:id', deleteCalendarData);
router.post('/write', addCalendarData);
router.post('/modify/:id', modifyCalendarData);
router.get('/crawling', crawlingCalendarData);

module.exports = router;
