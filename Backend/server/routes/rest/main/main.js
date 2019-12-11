const moment = require('moment');
const striptags = require('striptags');
const Sequelize = require('sequelize');
const models = require('../../../models');

// Calendar를 위해서 moment의 Weekday 명칭을 한국어로 바꿔주기
moment.updateLocale('en', {
  weekdaysShort: ['일', '월', '화', '수', '목', '금', '토']
});

/*
Author: Byeongnam
Function: getMainCalendar: 메인페이지 학사일정 8개 뽑아오기
*/
async function getMainCalendar() {
  const tcal = await models.Calendar.findAll({
    where: {
      startdate: {
        lte: new Date(),
      },
      enddate: {
        gte: new Date(),
      },
    },
    order: [['startdate', 'ASC'], ['enddate', 'ASC']],
    limit: 8,
  });
  const ncal = await models.Calendar.findAll({
    where: {
      startdate: {
        gt: new Date(),
      },
    },
    order: [['startdate', 'ASC'], ['enddate', 'ASC']],
    limit: 7,
  });
  const calresult = { today: [], near: [] };
  if ((tcal.length + ncal.length) !== 0) {
    if ((tcal.length + ncal.length) < 8) {
      calresult.today = tcal;
      calresult.near = ncal;
    } else {
      calresult.today = tcal;
      calresult.near = ncal.slice(0, 8 - tcal.length);
    }
  }

  calresult.today.forEach((data) => {
    data.dataValues.krstartdate = `${moment(data.startdate).format('MM.DD')}(${moment(data.startdate).format('ddd')})`;
    data.dataValues.krenddate = `${moment(data.enddate).format('MM.DD')}(${moment(data.enddate).format('ddd')})`;
  });

  calresult.near.forEach((data) => {
    data.dataValues.krstartdate = `${moment(data.startdate).format('MM.DD')}(${moment(data.startdate).format('ddd')})`;
    data.dataValues.krenddate = `${moment(data.enddate).format('MM.DD')}(${moment(data.enddate).format('ddd')})`;
  });

  return calresult;
}

/*
Author: Hyunsu Ko
Function: getMainGallery: 메인페이지 갤러리
*/
async function getMainGallery() {
  const gallery = await models.BoardPost.findAll({
    where: {
      BoardId: 14,
    },
    attributes: ['id', 'title', 'time', 'main'],
    order: [['id', 'DESC']],
    include: [{ model: models.BoardFile, attributes: ['path'] }],
    limit: 4,
  });
  return gallery;
}

/*
Author: Min Gi
Function: getMainRecent: 메인페이지 새소식가져오기
*/
async function getMainRecent(req, res) {
  const result = await models.BoardPost.findAll({
    where: {
      BoardId: [1, 2, 4],
    },
    order: [['createdAt', 'DESC']],
    limit: 5,
    hierarchy: true,
    attributes: ['id', 'title', 'text', 'createdAt', 'BoardId'],
  });
  await result.forEach((data) => {
    data.text = striptags(data.text);
    data.text = data.text.replace(/&nbsp;/g, ' ');
    data.text = data.text.replace(/&middot;/g, '.');
    data.text = data.text.replace(/(\r\n|\n|\r|)/gm, '');
    data.text = data.text.trim();
    if (data.BoardId === 16) {
      data.text = '뉴스레터 입니다.';
    } else if (!(data.text)) {
      data.text = '이미지 혹은 비디오로만 이루어진 글입니다.';
    }
  });
  res.send(
    result,
  );
}
/*
Author: Byeongnam
Function: getMainResearch: 메인페이지 연구소식 5개 추출
*/
async function getMainResearch() {
  const research = await models.BoardPost.findAll({
    where: {
      BoardId: {
        in: [3, 8],
      },
    },
    limit: 5,
    attributes: [
      'id',
      'title',
      'text',
      'time',
      'main',
      [Sequelize.fn('IFNULL', Sequelize.col('Professor.name'), '해당 없음'), 'Facultyname'],
    ],
    order: [['id', 'DESC']],
    include: [{
      model: models.Professor,
      attributes: ['lab'],
    },
    {
      model: models.Board,
      attributes: ['title'],
    }],
  });

  /* 고현수式 */
  research.forEach(async (e) => {
    const file = await models.BoardFile.findAll({ where: { BoardPostId: e.dataValues.id }, attributes: ['path'], limit: 1, });
    e.dataValues.path = file[0].dataValues.path;
  });

  /* 조건희式 */
  /* const files = await models.BoardFile.findAll({
    where: { BoardId: {in:[3,8]} },
    attributes: ['BoardPostId','path'],
  });
  const postlist = [];
  research.forEach((e) => {
    const Arr1 = files.filter(p => p.dataValues.BoardPostId === e.dataValues.id);
    e.dataValues.path = Arr1[0].path;
    postlist.push(e.dataValues);
  }); */
  return research;
}
/*
Author: Byeongnam
Function: getMainDataAll: 메인페이지 get함수 모두 호출
*/
async function getMainDataAll(req, res) {
  const calres = await getMainCalendar();
  const researchres = await getMainResearch();
  const galleryres = await getMainGallery();
  res.send({
    calresult: calres,
    research: researchres,
    gallery: galleryres,
  });
}


module.exports = {
  getMainDataAll,
  getMainRecent,
};
