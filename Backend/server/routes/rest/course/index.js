const aa = require('express-async-await');
const express = require('express');

const router = aa(express.Router());

const {
  viewCourse,
  viewCourseOne,
  viewCourseMajor,
  writeCourse,
  deleteCourse,
  modifyCourse
} = require('./course');

router.get('/', viewCourse);
router.get('/view/:id', viewCourseOne);
router.get('/major/:major', viewCourseMajor);
router.post('/write', writeCourse);
router.post('/delete/:id', deleteCourse);
router.post('/modify/:id', modifyCourse);

module.exports = router;
