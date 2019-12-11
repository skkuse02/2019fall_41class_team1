const mkdirp = require('async-mkdirp');
const models = require('../../../models');

/*
Author: Minjae Lyou
Function: page 보기
*/
async function viewPage(req, res) {
  const board = await models.BoardPost.findOne({
    where: {
      BoardId: 10,
      title: req.params.title,
    },
  });
  if (board) { // 글이 존재할경우
    res.send({
      result: true,
      post: board,
    });
  }
}


/*
Author: Kim Yunji
Function: modifyPage: page 수정
*/

async function modifyPage(req, res) {
  const page = await models.BoardPost.findOne({
    where: {
      BoardId: 10,
      title: req.params.title,
    },
    include: [
    {
      model: models.BoardFile,
      attributes: ['name', 'path', 'type', 'size', 'downs'],
      offset: 0,
      limit: 5,
      order: ['id', 'ASC'],
    }],
  });
  if (page) {
    await page.updateAttributes(req.body);
    res.send({ result: true });
  } else {
    res.send({ result: false });
  }
}


module.exports = {
  viewPage, modifyPage,
};
