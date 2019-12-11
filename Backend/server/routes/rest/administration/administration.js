const config = require('../../../config/config.json')[process.env.NODE_ENV || 'development'];
const path = require('path');
const fs = require('fs');
const async_fs = require('async-file');
const mkdirp = require('async-mkdirp');
const models = require('../../../models');

/*
Author: EunChan Park
Function: Administration 전체 리스트 가져오기
*/
async function getAds(req, res) {
  const ads = await models.Administration.findAll();
  res.send(ads);
}

/*
Author: MinJae Lyou
Function: administration 쓰기
*/
async function writeAd(req, res) {
  let sizeErr = true;
  const board = await models.Board.findOne({
    where: {
      title: 'administration',
    },
  });
  if (board) {
    req.body.photo = '';
    req.body.originadminname = req.body.name;
    const boardpost = await models.Administration.create(req.body);
    const file = req.files[0];
    if (file) {
      if (file.isFileSizeLimit) {
        sizeErr = false;
      } else {
        const file_name = `${Date.now()}-${file.originalname}`;
        const file_path = path.join(config.path.upload_path, board.title, file_name);
        await mkdirp(path.join(config.path.upload_path, board.title));
        await async_fs.rename(file.path, file_path);
        req.body.BoardId = board.id;
        req.body.BoardPostId = boardpost.id;
        req.body.name = file.originalname;
        req.body.path = `/${file_path.replace(/\\/g, '/')}`;
        req.body.type = file.mimetype;
        req.body.size = file.size;
        const boardFile = await models.BoardFile.create(req.body);
        req.body.photo = path.basename(file_path);
        req.body.name = req.body.originadminname;
        boardpost.updateAttributes(req.body);
        if (boardFile && sizeErr) {
          res.send({
            result: true,
          });
        } else {
          boardpost.destroy().then(() => {
            if (req.files.file_1) fs.unlinkSync(`.${req.files.file_1.path}`);
            if (req.files.file_2) fs.unlinkSync(`.${req.files.file_2.path}`);
            if (!sizeErr) {
              res.send({
                result: false,
                text: '파일 사이즈가 초과하였습니다. ( 최대 50MB )',
              });
            } else {
              res.send({
                result: false,
              });
            }
          });
        }
      }
    }
  }
}

/*
Author: MinJae Lyou
Function: administration 보기
*/
async function viewAd(req, res) {
  const board = await models.Board.findOne({
    where: {
      title: 'administration',
    },
  });
  if (board) {
    const data = await models.Administration.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (data) { // 글이 존재할경우
      // async.parallel({
      // async function{
      const files = await models.BoardFile.findOne({
        attributes: ['name', 'path', 'type', 'size', 'downs'],
        offset: 0,
        limit: 1,
        order: models.sequelize.literal('id DESC'),
        where: {
          BoardId: board.id,
          BoardPostId: data.id,
        },
      });
      if (files) {
        // files.forEach(async (file) => {
        files.link = `/rest/board/file/download/${board.title}/${path.basename(files.path)}`;
        delete files.path;
        // });
      }
      // }
      // });
      data.files = files;
      res.send(data);
      /* if (results) {
        data[0].files = results.files;
        res.send({
          result: true,
          post: data[0],
        });
      } */
    }
  }
}

/*
Author: MinJae Lyou
Function: administration 수정
*/
async function modifyAd(req, res) {
  let sizeErr = true;
  const board = await models.Administration.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (board) {
    req.body.originadminname = await req.body.name;
    const boardpost = await board.updateAttributes(req.body);
    const file = req.files[0];
    if (file) {
      if (file.isFileSizeLimit) {
        sizeErr = false;
      } else {
        const file_name = await `${Date.now()}-${file.originalname}`;
        const file_path = path.join(config.path.upload_path, 'administration', file_name);
        await mkdirp(path.join(config.path.upload_path, 'administration'));
        await async_fs.rename(file.path, file_path);
        req.body.BoardId = 11;
        req.body.BoardPostId = boardpost.id;
        req.body.name = file.originalname;
        req.body.path = `/${file_path.replace(/\\/g, '/')}`;
        req.body.type = file.mimetype;
        req.body.size = file.size;
        await models.BoardFile.create(req.body);
        req.body.photo = await path.basename(file_path);
        req.body.name = await req.body.originadminname;
        await boardpost.updateAttributes(req.body);
      }
    }
    if (sizeErr) {
      res.send({
        result: true,
      });
    } else {
      if (req.files.file_1) fs.unlinkSync(`.${req.files.file_1.path}`);
      if (req.files.file_2) fs.unlinkSync(`.${req.files.file_2.path}`);
      res.send({
        result: false,
        text: '파일 사이즈가 초과하였습니다. ( 최대 50MB )',
      });
    }
  }
}

/*
Author: MinJae Lyou
Function: administration 삭제
*/
async function deleteAd(req, res) {
  const administration = await models.Administration.destroy({
    where: {
      id: req.params.id,
    },
  });
  if (administration) {
    res.send({
      result: true,
    });
  } else {
    res.send({
      result: false,
    });
  }
}

/*
Author: MinJae Lyou
Function: 파일 삭제
*/
async function deleteFile(req, res) {
  const board = await models.BoardFile.findOne({
    where: {
      BoardId: 11,
      BoardPostId: req.params.id,
    },
  });
  if (board) {
    await fs.unlinkSync(`.${board.path}`);
    const destroy = await models.BoardFile.destroy({
      where: {
        BoardId: 11,
        BoardPostId: req.params.id,
      },
    });
    if (destroy) {
      res.send({
        result: true,
      });
    }
  } else {
    res.send({
      result: false,
    });
  }
}
module.exports = {
  deleteFile, deleteAd, modifyAd, viewAd, writeAd, getAds
};
