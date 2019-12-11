const fs = require('async-file');
const mkdirp = require('async-mkdirp');
const path = require('path');
const config = require('../../../config/config.json')[process.env.NODE_ENV || 'development'];
const models = require('../../../models');

/*
Author: Minjae Lyou
Function: 팝업 리스트 불러오기
*/
async function getPopupList(req, res) {
  const popups = await models.Popup.findAll({
    order: [
      ['id', 'DESC'],
    ],
    attributes: [
      'id',
      'title',
      'start',
      'end',
      'createdAt']
  });
  await popups.map((popup) => {
    popup.dataValues.start = new Date(popup.dataValues.start).toLocaleString();
    popup.dataValues.end = new Date(popup.dataValues.end).toLocaleString();
    popup.dataValues.createdAt = new Date(popup.dataValues.createdAt).toLocaleString();
  });
  if (popups) {
    res.send({
      result: true,
      data: popups,
    });
  }
}

/*
Author: Minjae Lyou
Function: 팝업 보기
*/
async function viewPopup(req, res) {
  const board = await models.Board.findOne({
    where: {
      title: 'popup'
    }
  });
  const popup = await models.Popup.findOne({
    where: {
      id: req.params.id
    }
  });
  const file = await models.BoardFile.findOne({
    where: {
      BoardPostId: req.params.id,
      BoardId: board.id
    },
    attributes: ['name', 'path', 'type', 'size', 'downs']
  });
  // file.link = '/ajax/board/file/download/' + board.title + '/' + path.basename(file.path);
  // file.link = `/rest/board/file/download/${board.title}/${path.basename(file.path)}`;
  // delete file.path;
  if (popup) {
    const prev = await models.Popup.findAll({
      where: {
        id: {
          gt: req.params.id,
        },
      },
      attributes: ['id'],
      offset: 0,
      limit: 1,
      order: 'id',
    });
    const next = await models.Popup.findAll({
      attributes: ['id'],
      offset: 0,
      limit: 1,
      order: [
        ['id', 'DESC'],
      ],
      where: {
        id: {
          lt: req.params.id,
        },
      },
    });
    popup.dataValues.start = new Date(popup.dataValues.start).toLocaleString();
    popup.dataValues.end = new Date(popup.dataValues.end).toLocaleString();
    popup.dataValues.createdAt = new Date(popup.dataValues.createdAt).toLocaleString();
    popup.file = file;
    res.send({
      result: true,
      post: popup,
      prev,
      next
    });
  } else {
    res.send({
      result: false
    });
  }
}

/*
Author: KoHyunsu
Function: 팝업 추가하기
*/
async function addPopup(req, res) {
  const file = req.files[0];
  if (file) {
    // 1.1 파일처리 - 파일 사이즈 점검
    if (!(file.isFileSizeLimit)) {
      // 1.2 파일처리 - 파일 이름 설정
      let fileName = Date.now();
      fileName += '-';
      fileName += file.originalname;
      // 1.3 파일처리 - 파일 경로 설정. fs.rename 에러 핸들링을 위해 불가피하게 callback 사용.
      const filePath = await path.join(config.path.upload_path, 'popup', fileName);
      await mkdirp(path.join(config.path.upload_path, 'popup'));
      await fs.rename(file.path, filePath);
      // `/${filePath.replace(/\\/g, '/')}`
      // 1.4 파일처리 - 파일 정보 입력
      req.body.path = `/${filePath.replace(/\\/g, '/')}`;
    }
  }
  // 2. 팝업추가 - 새 모델 생성
  const popup = await models.Popup.create({
    title: req.body.title,
    text: req.body.text,
    start: req.body.start,
    end: req.body.end,
    path: req.body.path,
    height: req.body.height,
    width: req.body.width,
    link: req.body.link
  });
  if (popup) {
    res.send({ result: true });
  } else {
    res.send({ result: false });
  }
}

/*
Author: KoHyunsu
Function: 팝업 수정하기
*/
async function modifyPopup(req, res) {
  const file = req.files[0];
  if (file) {
    // 1.1 파일처리 - 파일 사이즈 점검
    if (!(file.isFileSizeLimit)) {
      // 1.2 파일처리 - 파일 이름 설정
      let fileName = Date.now();
      fileName += '-';
      fileName += file.originalname;
      // 1.3 파일처리 - 파일 경로 설정. fs.rename 에러 핸들링을 위해 불가피하게 callback 사용.
      const filePath = await path.join(config.path.upload_path, 'popup', fileName);
      await mkdirp(path.join(config.path.upload_path, 'popup'));
      await fs.rename(file.path, filePath);
      // 1.4 파일처리 - 파일 정보 입력
      req.body.path = `/${filePath.replace(/\\/g, '/')}`;
    }
  }
  // 2. 팝업수정 - 정보 업데이트
  const popup = await models.Popup.update({
    title: req.body.title,
    text: req.body.text,
    start: req.body.start,
    end: req.body.end,
    path: req.body.path,
    height: req.body.height,
    width: req.body.width,
    link: req.body.link
  }, {
    where: {
      id: req.params.id
    },
  });
  if (popup) {
    res.send({ result: true });
  } else {
    res.send({ result: false });
  }
}

/*
Author: Minjae Lyou
Function: 팝업 삭제하기
*/
async function deletePopup(req, res) {
  const destroy = await models.Popup.destroy({
    where: {
      id: req.params.id
    }
  });
  if (destroy) {
    res.send({
      result: true
    });
  } else {
    res.send({
      result: false
    });
  }
}

async function downFile(req, res) {
  const file = await models.Popup.findOne({
    where: { id: req.params.id }
  });
  if (file) {
    const filePath = file.path.replace('/webdata', 'webdata');
    if (file.path === '0') {
      res.send({ result: false, text: 'path is null' });
    } else {
      res.download(filePath);
    }
  } else {
    res.send({ result: false, text: 'path is null' });
  }
}
async function getPopupMain(req, res) {
  const popups = await models.Popup.findAll({
    where: {
      start: { lte: new Date() },
      end: { gte: new Date() }
    }
  });
  if (popups) {
    res.send({
      result: true,
      data: popups,
    });
  }
}
module.exports = {
  getPopupList, viewPopup, addPopup, modifyPopup, deletePopup, downFile, getPopupMain
};
