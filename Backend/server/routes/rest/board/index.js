const aa = require('express-async-await');
const express = require('express');
const upload = require('../../../config/upload.js');

const router = aa(express.Router());


const {
  getBoardList, getFirstList, getBoardPost, addBoardPost, addImage, modifyBoardPost, deleteBoardPost, downFile, deleteFile,
} = require('./board');

router.get('/list/:title', getBoardList);
router.get('/firstlist/:title', getFirstList);
router.get('/view/:title/:id', getBoardPost);
router.get('/file/download/:title/:file_id', downFile);

// 게시글 수정 api 세션 체크
router.all('*', function(req, res, next) {
  if(req.session) {
    next();
  } else {
    res.send(404);
  }
});

router.post('/delete/:title/:id', deleteBoardPost);
router.post('/write/:title', upload, addBoardPost);
router.post('/modify/:title/:id', upload, modifyBoardPost);
router.post('/file/delete/:file_id', deleteFile);
router.post('/image', upload, addImage);

module.exports = router;
