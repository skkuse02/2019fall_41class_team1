// newsletter 라우팅 입니다.

const path = require('path');
const fs = require('async-file');
const mkdirp = require('async-mkdirp');
const moment = require('moment');

const models = require('../../../models');

const config = require('../../../config/config.json')[process.env.NODE_ENV || 'development'];
const boardCache = new (require('../../../util/boardCache'))().getInstance();

/*
Author: KunHee
Function: 목록 정보를 불러올때 사용하는 함수
          이미지경로, 호(edition), 제목, 주요소식(3가지), 조회수들을 가져온다.
*/
async function getNewsletter(req, res) {
  // 1. 호, 제목, 주요소식들을 불러온다.
  const newsletters = await models.Newsletter.findAll({
    include: {
      model: models.Newscontent,
      attributes: ['text']
    },
    order: [
      ['id', 'DESC'],
    ],
    attributes: ['id', 'edition', 'title']
  });

  // 2. 조회수와 이미지 저장 경로 불러오기
  const posts = await models.BoardPost.findAll({
    where: { BoardId: 16 },
    attributes: ['text', 'views']
  });

  const files = await models.BoardFile.findAll({
    where: { BoardId: 16 },
    attributes: ['name', 'path']
  });

  const postlist = [];

  try {
    newsletters.forEach((e) => {
      const letter_id = String(e.dataValues.id);

      // 조회수 불러오기
      const Arr1 = posts.filter(p => p.text === letter_id);
      const letter_view = Arr1[0].views;

      // 이미지 저장 경로 불러오기
      const Arr2 = files.filter(p => p.name === letter_id);
      const file_path = Arr2[0].path;

      e.dataValues.views = letter_view;
      e.dataValues.photo = file_path;
      postlist.push(e.dataValues);
    });

    res.send({ aaData: postlist });
  } catch (error) {
    console.log(error);
    res.send({ result: false });
  }
}

/*
Author: KunHee
Function: 뉴스레터 하나 볼 때 사용하는 함수
          1. 조회수를 증가시킨다.
          2. 보고있는 뉴스레터, 양 옆 정보들도 같이 불러온다. 예전 기능과 동일
          보내는 정보: 이미지경로, 제목
*/
async function viewNewsletter(req, res) {
  // 기존 정보 불러오기
  const letter = await models.Newsletter.findOne({
    where: { id: req.params.id }
  });
  const p_path = await models.BoardFile.findOne({ // 이미지 저장 경로 불러오기
    where: { name: req.params.id },
    attributes: ['path']
  });
  letter.dataValues.photo = p_path.path;
  const parent = letter.dataValues;

  // 1. 조회수 증가
  const post_view = await models.BoardPost.findOne({
    where: { text: req.params.id },
    attributes: ['views']
  });
  let view = post_view.views; // 기존 조회수 불러오기
  view += 1;
  await models.BoardPost.update({ views: view }, { where: { text: req.params.id } });

  // 2. 뉴스레터 양옆 정보 불러오기
  const posts = await models.Newsletter.findAll({
    attributes: ['id', 'title'],
    order: [['id', 'DESC']],
  });

  const files = await models.BoardFile.findAll({
    where: { BoardId: 16 },
    attributes: ['name', 'path']
  });

  const postlist = { p: parent, s: [], n: [] }; // s는 모든 데이터, n은 s에서 p의 index
  posts.forEach((e, index) => {
    const letter_id = String(e.dataValues.id);
    const Arr2 = files.filter(p => p.name === letter_id);
    const file_path = Arr2[0].path;
    e.dataValues.photo = file_path;
    postlist.s.push(e.dataValues);
    if (e.dataValues.id === parent.id) {
      postlist.n.push(index);
    }
  });
  res.send({ aaData: postlist });
}

/*
Author: KunHee
Function: 1. 뉴스레터 글 작성
*/
async function writeNewsletter(req, res) {
  const file = req.files[0];
  let file_name = Date.now();
  file_name += '-';
  file_name += file.originalname;
  const file_path = await path.join(config.path.upload_path, 'newsletter', file_name);
  await mkdirp(path.join(config.path.upload_path, 'newsletter'));
  await fs.rename(file.path, file_path); // source/public/newsletter로 파일 이동

  // 1. 뉴스레터 생성
  const letter = await models.Newsletter.create({
    edition: req.body.edition,
    title: req.body.title,
  });

  const letter_Id = letter.id;
  
  // 2. 뉴스레터컨텐츠 생성
  await models.Newscontent.bulkCreate([{
    text: req.body.content1,
    NewsletterId: letter_Id,
  },
  {
    text: req.body.content2,
    NewsletterId: letter_Id,
  },
  {
    text: req.body.content3,
    NewsletterId: letter_Id,
  },
  ]);

  // 3단계 boardpost 추가 (메인 페이지 새소식에 띄우기)
  // 기존의 views를 boardpost view로 대체
  const post = await models.BoardPost.create({
    title: req.body.edition,
    text: letter_Id,
    time: moment(new Date()).format('YYYY-MM-DD'),
    /* ip: , */
    /* views: , */
    /* fixDate: , */
    /* category: , */
    main: 4, /* 매인 노출 4 */
    BoardId: 16,
    UserId: req.body.userId,
  });

  const boardpost_id = post.id;
  // 4단계 boardfile에 추가(기존의 photo를 path로 역할 대체)
  await models.BoardFile.create({
    name: letter_Id,
    path: `/${file_path.replace(/\\/g, '/')}`,
    type: file.mimetype,
    size: file.size,
    /* downs:  , */
    /* UserId: , */
    BoardId: 16,
    BoardPostId: boardpost_id,
  });
  boardCache.validateCachePrivate('news');
  res.send({ result: true });
}

/*
Author: KunHee
Function: 1. 새로 받은 파일은 새로 저장
          2. 주요소식(3가지) 삭제 후
          3. 뉴스레터 boardpost, boardfile는 입력받은 값으로 새로 업데이트
          4. 주요소식은 입력받는 값으로 생성된다
*/
async function modifyNewsletter(req, res) {

  const letterid = req.params.id;

  // 뉴스레터 업데이트
  await models.Newsletter.update({
    edition: req.body.edition,
    title: req.body.title,
  }, {
    where: {
      id: letterid,
    },
  });

  // 주요소식 모두 삭제 후 다시 새로 생성
  await models.Newscontent.destroy({
    where: {
      NewsletterId: letterid,
    },
  });

  await models.Newscontent.bulkCreate([{
    text: req.body.content1,
    NewsletterId: letterid,
  },
  {
    text: req.body.content2,
    NewsletterId: letterid,
  },
  {
    text: req.body.content3,
    NewsletterId: letterid,
  },
  ]);

  // boardpost 업데이트

  await models.BoardPost.update({
    title: req.body.edition
  }, {
    where: {
      BoardId: 16,
      text: letterid,
    },
  });

  // boardfile 업데이트
  if (req.files.length) {
    const file = req.files[0];
    let file_name = Date.now();
    file_name += '-';
    file_name += file.originalname;
    const file_path = path.join(config.path.upload_path, 'newsletter/', file_name);
    await mkdirp(path.join(config.path.upload_path, 'newsletter'));
    /* // 기존 파일 삭제
    fs.unlinkSync(old_file_path); */
    await fs.rename(file.path, file_path); // source/public/newsletter에 저장

    await models.BoardFile.update({
      path: `/${file_path.replace(/\\/g, '/')}`,
    }, {
      where: {
        BoardId: 16,
        name: letterid,
      },
    });
  }

  boardCache.validateCachePrivate('news');
  res.send({ result: true });
}

/*
Author: KunHee
Function: 1. 뉴스레터 글, 주요소식, boardpost 삭제,
*/
async function deleteNewsletterPost(req, res) {
  const letterId = req.params.id;
  await models.Newsletter.destroy({
    where: {
      id: letterId,
    },
  });
  await models.BoardPost.destroy({
    where: {
      text: letterId,
      BoardId: 16,
    },
  });
  await models.BoardFile.destroy({
    where: {
      name: letterId,
      BoardId: 16,
    },
  });
  
  boardCache.validateCachePrivate('news');
  res.send({ result: true });
}

/*
Author: KunHee
Function: 1. 뉴스레터 다운로드
*/
async function downloadNewsletter(req, res) {
  const newsletter = await models.BoardFile.findOne({
    where: { name: req.params.id, BoardId: 16 }
  });
  if (newsletter) {
    const letterpath = newsletter.path.replace('/webdata', 'webdata');
    if (newsletter.path === '0') {
      res.send({ result: false, text: 'path is null' });
    } else {
      res.download(letterpath);
    }
  } else {
    res.send({ result: false, text: 'path is null' });
  }
}

/*
Author: KunHee
Function: 뉴스레터 수정 시 사용하는 함수
          1. 뉴스레터 이미지 파일 삭제
          2. 이미지 저장 경로를 0으로 만든다.
*/
async function deleteNewsletterFile(req, res) {
  const file = await models.BoardFile.findOne({ where: { name: req.params.id, BoardId: 16 } });
  file_path = file.path;
  fs.unlinkSync(file_path);
  // 뉴스레터 경로 0으로 저장
  const result = await models.BoardFile.update(
    { path: 0 },
    { where: { name: req.params.id } }
  );

  if (result) {
    res.send({ result: true });
  } else {
    res.send({ result: false });
  }
}

/*
Author: KunHee
Function: 뉴스레더 수정 시 사용하는 함수
          1. 수정 페이지 접속할때 뉴스레터 데이터들을 불러온다.
          보내는 정보: id, 호, 제목, 이미지 저장 경로, 이미지 크기,  주요소식(3가지)
*/
async function retrieveNewsletter(req, res) {
  const letter = await models.Newsletter.findOne({
    where: { id: req.params.id },
    attributes: ['edition', 'title', 'id'],
    include: [{
      model: models.Newscontent,
      where: { NewsletterId: req.params.id },
      attributes: ['text']
    }],
  });
  const data = letter.dataValues;

  const letter_file = await models.BoardFile.findOne({
    where: { name: req.params.id, BoardId: 16 },
    attributes: ['path', 'size']
  });
  data.photo = letter_file.path;
  data.size = letter_file.size;
  res.send({ result: data });
}


module.exports = {
  getNewsletter,
  viewNewsletter,
  writeNewsletter,
  modifyNewsletter,
  deleteNewsletterPost,
  retrieveNewsletter,
  downloadNewsletter,
  deleteNewsletterFile,
};
