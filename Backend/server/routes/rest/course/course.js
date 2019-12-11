const models = require('../../../models');

/*
Author: MinJae Kang
Function: writeCourse: 교육과정 작성
*/
async function writeCourse(req, res) {
  const course = await models.Course.create(req.body);
  if (course) {
    res.send({ result: true });
  } else {
    res.send({ result: false });
  }
}

/*
Author: MinJae Kang
Function: viewCourse: 교육과정 전부 불러오기
*/
async function viewCourse(req, res) {
  const course = await models.Course.findAll({
    where: {
      section: '학부/학과'
    },
    order: [['subject_name', 'ASC']],
    attributes: ['id', 'subject_name', 'major', 'credit', 'category']
  });
  res.send(course);
}

/*
Author: CHo Kun Hee
Function: viewCourseOne: 교육과정 하나 보기
*/
async function viewCourseOne(req, res) {
  const course = await models.Course.findOne({
    where: {
      id: req.params.id
    },
    attributes: ['id', 'section', 'major', 'degree', 'category', 'credit', 'subject_name', 'text']
  });
  if (course) {
    res.send(course.dataValues);
  } else {
    res.send({ result: false });
  }
}

/*
Author: CHo Kun Hee
Function: viewCourseMajor: 교육과정 전공 찾기
*/
async function viewCourseMajor(req, res) {
  const course = await models.Course.findAll({
    where: {
      section: '학부/학과',
      major: req.params.major
    },
    order: [['subject_name', 'ASC']],
    attributes: ['id', 'subject_name', 'major', 'credit', 'category']
  });
  if (course) {
    res.send(course);
  } else {
    res.send({ result: false });
  }
}

/*
Author: MinJae Kang
Function: modifyCourse: 이미 존재하는 교육과정 1개 수정
*/
async function modifyCourse(req, res) {
  const course = await models.Course.findOne({
    where: {
      id: req.params.id
    }
  });
  if (course) {
    await course.updateAttributes(req.body);
    res.send({ result: true });
  } else {
    res.send({ result: false });
  }
}

/*
Author: MinJae Kang
Function: deleteCourse: 교육과정 1개 삭제
*/
async function deleteCourse(req, res) {
  const course = await models.Course.destroy({
    where: {
      id: req.params.id,
    },
  });
  if (course) {
    res.send({ result: true });
  } else {
    res.send({ result: false });
  }
}

module.exports = {
  viewCourse,
  viewCourseOne,
  viewCourseMajor,
  writeCourse,
  deleteCourse,
  modifyCourse
};
