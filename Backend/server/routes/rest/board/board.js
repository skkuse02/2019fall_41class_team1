const async = require('async');
const Sequelize = require('sequelize');
const fs = require('async-file');
const fs1 = require('fs');
const mkdirp = require('async-mkdirp');
const path = require('path');
const config = require('../../../config/config.json')[process.env.NODE_ENV || 'development'];
const models = require('../../../models');
const boardCache = new (require('../../../util/boardCache'))().getInstance();

/*
Author: Hyunsu Ko
Function: 보드파일 생성
*/
async function addBoardFile(req, board, boardpost) {
  req.files.forEach(async (file) => {
    if (file) {
      // 1.1 파일처리 - 파일 사이즈 점검
      if (!(file.isFileSizeLimit)) {
        // 1.2 파일처리 - 파일 이름 설정
        let fileName = Date.now();
        fileName += '-';
        fileName += file.originalname;
        // 1.3 파일처리 - 파일 경로 설정. fs.rename 에러 핸들링을 위해 불가피하게 callback 사용.
        const filePath = await path.join(config.path.upload_path, board.title, fileName);
        await mkdirp(path.join(config.path.upload_path, board.title));
        await fs.rename(file.path, filePath);
        // 2. 보드파일 생성 - 파일 정보 입력
        const boardfile = await models.BoardFile.create({
          UserId: req.body.UserId,
          BoardId: board.id,
          BoardPostId: boardpost.id,
          name: file.originalname,
          path: `/${filePath.replace(/\\/g, '/')}`,
          type: file.mimetype,
          size: file.size,
        });
        if (boardfile) return true;
      }
    }
    return false;
  });
}

/*
Author: Hyunsu Ko
Function: 보드파일 수정

*/
// 제1안 req.files[]에 파일 안 채우면 기존 거 유지, 기존이랑 바뀐 req.files[]만 보드파일 업데이트하는 방식
async function modfiyBoardFile(req, board, boardpost, boardfiles) {
  // 1.1 파일처리 - req.files와 boardfiles 알맞게 대응되도록 순서 배치
  const inputfiles = [null, null, null, null, null, null];
  req.files.forEach((file) => {
    switch (file.fieldname) {
      case 'thumb': inputfiles[0] = file; break;
      case 'file_1': inputfiles[1] = file; break;
      case 'file_2': inputfiles[2] = file; break;
      case 'file_3': inputfiles[3] = file; break;
      case 'file_4': inputfiles[4] = file; break;
      case 'file_5': inputfiles[5] = file; break;
      default: break;
    }
  });
  let i = 0;
  while (i <= 5) {
    // 1.2 파일처리 - req.files, boardfiles 동시 반복을 위해 while 사용
    if (inputfiles[i] && !(inputfiles[i].isFileSizeLimit)) {
      // 2. 기존파일 존재시 해당 파일수정
      if (boardfiles[i]) {
        // 2.1 파일수정 - 파일 이름 설정
        let fileName = Date.now();
        fileName += '-';
        fileName += inputfiles[i].originalname;
        // 2.2 파일수정 - 파일 경로 설정. fs.rename 에러 핸들링을 위해 불가피하게 callback 사용.
        const filePath = path.join(config.path.upload_path, board.title, fileName);
        await fs.rename(inputfiles[i].path, filePath);
        // 2.3 파일수정 - 기존 파일에 업데이트
        await models.BoardFile.update(
          {
            UserId: boardpost.userId,
            name: inputfiles[i].originalname,
            path: `/${filePath.replace(/\\/g, '/')}`,
            type: inputfiles[i].mimetype,
            size: inputfiles[i].size,
          },
          { where: { id: boardfiles[i].id } },
        );
      } else {
        // 3. 기존파일 부재시 새로 파일생성
        // 3.1 파일생성 - 파일 이름 설정
        let fileName = Date.now();
        fileName += '-';
        fileName += inputfiles[i].originalname;
        // 3.2 파일생성 - 파일 경로 설정
        const filePath = path.join(config.path.upload_path, board.title, fileName);
        await fs.rename(inputfiles[i].path, filePath);
        // 3.3 보드파일 생성 - 파일 정보 입력
        models.BoardFile.create({
          UserId: req.body.UserId,
          BoardId: board.id,
          BoardPostId: boardpost.id,
          name: inputfiles[i].originalname,
          path: `/${filePath.replace(/\\/g, '/')}`,
          type: inputfiles[i].mimetype,
          size: inputfiles[i].size,
        });
      }
    }
    i += 1;
  }
  return true;
}

// 제2안 기존 거 모두 삭제 후, req.files[]에 있는 걸로 새로 보드파일 생성하는 방식
/* async function modfiyBoardFile(req, board, boardpost, boardfiles) {
  // 1 기존파일 전부 삭제
  console.log(boardfiles);
  boardfiles.forEach((file) => { file.destroy(); });
  // 2.1 파일대응 - req.files와 boardfiles 알맞게 대응되도록 순서 배치
  const inputfiles = [null, null, null, null, null, null];
  req.files.forEach((file) => {
    switch (file.fieldname) {
      case 'thumb': inputfiles[0] = file; break;
      case 'file_1': inputfiles[1] = file; break;
      case 'file_2': inputfiles[2] = file; break;
      case 'file_3': inputfiles[3] = file; break;
      case 'file_4': inputfiles[4] = file; break;
      case 'file_5': inputfiles[5] = file; break;
      default: break;
    }
  });
  let i = 0;
  // 2.2 파일대응 - req.files, boardfiles 동시 반복을 위해 while 사용
  while (i <= 5) {
    if (inputfiles[i] && !(inputfiles[i].isFileSizeLimit)) {
      // 3.1 파일처리 - 파일 이름 설정
      console.log(boardpost.UserId);
      console.log(boardpost.id);
      console.log(board.id);
      let fileName = Date.now();
      fileName += '-';
      fileName += inputfiles[i].originalname;
      // 3.2 파일처리 - 파일 경로 설정
      const filePath = path.join(config.path.upload_path, board.title, fileName);
      await fs.rename(inputfiles[i].path, filePath, (err) => {
        if (err) { boardpost.destroy(); fs.unlinkSync(file.path); }
      });
      // 4. 보드파일 생성 - 파일 정보 입력
      await models.BoardFile.create({
        UserId: boardpost.UserId,
        BoardId: board.id,
        BoardPostId: boardpost.id,
        name: inputfiles[i].originalname,
        path: `/${filePath.replace(/\\/g, '/')}`,
        type: inputfiles[i].mimetype,
        size: inputfiles[i].size,
      });
    }
    i += 1;
  }
  return true;
} */

/*
Author: Hyunsu Ko
Function: 보드포스트 생성
관리자 권한 확인 필요!!! Window 확인 필요!!!
*/
async function addBoardPost(req, res) {
  // 1. 보드정보 - :title에 해당하는 보드를 가지고 온다.
  boardCache.validateCache(req.params.title);
  const board = await models.Board.findOne({ where: { title: req.params.title } });
  if (board) {
    const userIp = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null)).split(",")[0];// 2. 유저정보 - UserId 업데이트
    // req.body.UserId = req.session.user.id;
    // 더미 세션 데이터
// const userIp = '115.145.172.33' // 일단 응급 처치
	  // console.log(userIp)
    req.body.ip = userIp;
    req.body.BoardId = board.id;
    // 3. 보드포스트 생성
    const boardpost = await models.BoardPost.create(req.body);
    if (boardpost.title) {
      // 4. 해당 보드포스트의 보드파일 생성
      if (addBoardFile(req, board, boardpost)) {
        res.send({ result: true });
      } else {
        res.send({ result: false, text: 'uploading error' });
      }
    } else {
      const destroyboardpost = await boardpost.destroy();
      if (destroyboardpost) res.send({ result: false, text: 'no boardpost title' });
    }
  } else {
    res.send({ result: false, text: 'no boardlist' });
  }
}

/*
  Author: 조우림
  Function: 이미지 추가 (CKEditor)
  참조: https://ckeditor.com/docs/ckeditor4/latest/guide/dev_file_upload.html
*/

async function addImage(req, res) {
  const file = req.files[0];
  if (!file) {
    res.send({ uploaded: 0 });
  } else {
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = await path.join(config.path.upload_path, 'image', fileName);
    await mkdirp(path.join(config.path.upload_path, 'image'));
    await fs.rename(file.path, filePath);
    res.send({ uploaded: 1, fileName, url: `/webdata/sw/uploads/image/${fileName}` });
  }
}

/*
Author: Hyunsu Ko
Function: 보드포스트 수정
관리자 권한 확인 필요!!! Window 확인 필요!!!
*/
async function modifyBoardPost(req, res) {
  boardCache.validateCache(req.params.title);
  // 1. 보드정보 - :title에 해당하는 보드를 가지고 온다.
  const board = await models.Board.findOne({ where: { title: req.params.title } });
  // 2. 보드포스트정보 - :id에 해당하는 보드포스트를 가지고 온다.
  const boardpost = await models.BoardPost.findOne({ where: { id: req.params.id } });
  if (board && boardpost) {
    // 3. 해당 보드포스트정보 수정
    await models.BoardPost.update(
      {
        UserId: req.body.userId,
        ProfessorId: req.body.FacultyId,
        ip: (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null)).split(",")[0],
        title: req.body.title,
        category: req.body.category,
        text: req.body.text,
        time: req.body.time,
        fixDate: req.body.fixDate,
      }, { where: { id: boardpost.id } },
    );
    // 4. 보드파일정보 - 해당 보드포스트에 속한 보드파일 모두 불러옴.
    const boardfiles = await models.BoardFile.findAll({ where: { BoardPostId: boardpost.id } });
    // 5. 보드파일 수정
    const newboardfiles = await modfiyBoardFile(req, board, boardpost, boardfiles);
    if (newboardfiles) { res.send({ result: true }); } else { res.send({ result: false }); }
  } else { res.send({ result: false }); }
}

/*
Author: Byeongnam
Function: getBoardList = title에 해당하는 게시글 list 가져 오기, 아직 상단공지 처리는 하지 않음.
*/
async function getBoardList(req, res) {
  if (boardCache.getTotalList(req.params.title)) {
    res.send(boardCache.getTotalList(req.params.title));
    return;
  }

  if (req.params.title === 'recent') {
    const list = await models.BoardPost.findAll({
      attributes: [
        'id',
        'title',
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('BoardPost.createdAt'), '%Y-%m-%d'), 'time'],
        'views',
        [Sequelize.fn('IFNULL', Sequelize.col('User.name'), '해당 없음'), 'Username'],
      ],
      where: {
        BoardId: [1, 3, 4, 8],
      },
      include: [{
        model: models.Board,
        attributes: ['title', 'comment'],
      }, {
        model: models.User,
        attributes: [],
      }],
      order: [
        ['createdAt', 'DESC'],
      ],
    });

    let ret = {
      aaData: list,
      fixlist: [],
    };

    boardCache.setTotalCache(req.params.title, ret);
    res.send(ret);
  } else {
    const board = await models.Board.findOne({
      where: {
        title: req.params.title,
      }
    });
    if (board) {
      if (req.params.title === 'gallery') {
        const list = await models.BoardPost.findAll({
          where: {
            BoardId: board.id,
          },
          attributes: [
            'id',
            'category',
            'title',
            'views',
            [Sequelize.fn('DATE_FORMAT', Sequelize.col('BoardPost.time'), '%Y.%m.%d'), 'time'],
            'fixDate',
            [Sequelize.fn('IFNULL', Sequelize.col('User.name'), '해당 없음'), 'Username'],
            [Sequelize.fn('IFNULL', Sequelize.col('Professor.name'), '해당 없음'), 'Facultyname'],
          ],
          include: [{
            model: models.User,
            attributes: [],
          },
          {
            model: models.Professor,
            attributes: [],
          },
          {
            model: models.BoardFile,
            attributes: ['path', 'name', 'downs'],
          }],
          order: [
            [Sequelize.fn('IF', Sequelize.literal('`BoardPost`.`fixDate` > NOW()'), [1, 0]), 'DESC'],
            ['id', 'DESC'],
          ],
        });

        let ret = {
          aaData: list,
        };
        
        boardCache.setTotalCache(req.params.title, ret);

        res.send(ret);
      } else {
        const fixids = await models.BoardPost.findAll({
          where: {
            BoardId: board.id,
            fixDate: {
              $gt: new Date(),
            },
          },
          attributes: ['id'],
          order: [
            ['id', 'DESC'],
          ],
          limit: 5,
        });
        //fix될 글이 없으면 idlist가 빈 어레이가 된다. 그때 빈 어레이로 notIn을 이용하면 터진다. 그래서
        //일부러 idlist를 빈어레이 안만들려고 0을 집어넣었다.
        const idlist = [0];
        fixids.forEach((post) => {
          idlist.push(post.id);
        });
        const list = await models.BoardPost.findAll({
          where: {
            BoardId: board.id,
            id: {
              $notIn: idlist,
            }
          },
          attributes: [
            'id',
            'category',
            'title',
            'views',
            [Sequelize.fn('DATE_FORMAT', Sequelize.col('BoardPost.createdAt'), '%Y.%m.%d'), 'time'],
            [Sequelize.fn('IFNULL', Sequelize.col('User.name'), '해당 없음'), 'Username'],
            [Sequelize.fn('IFNULL', Sequelize.col('Professor.name'), '해당 없음'), 'Facultyname'],
          ],
          include: [{
            model: models.User,
            attributes: [],
          },
          {
            model: models.Professor,
            attributes: [],
          },
          {
            model: models.BoardFile,
            attributes: ['path', 'name', 'downs'],
          }],
          order: [
            ['id', 'DESC'],
          ],
        });
        if (idlist.length !== 0) {
          const fixlist = await models.BoardPost.findAll({
            where: {
              BoardId: board.id,
              id: {
                $in: idlist,
              }
            },
            attributes: [
              'id',
              'category',
              'title',
              'views',
              [Sequelize.fn('DATE_FORMAT', Sequelize.col('BoardPost.createdAt'), '%Y.%m.%d'), 'time'],
              [Sequelize.fn('IFNULL', Sequelize.col('User.name'), '해당 없음'), 'Username'],
              [Sequelize.fn('IFNULL', Sequelize.col('Professor.name'), '해당 없음'), 'Facultyname'],
            ],
            include: [{
              model: models.User,
              attributes: [],
            },
            {
              model: models.Professor,
              attributes: [],
            },
            {
              model: models.BoardFile,
              attributes: ['path', 'name', 'downs'],
            }],
            order: [
              ['id', 'DESC'],
            ],
          });

          let ret = {
            aaData: fixlist.concat(list),
            fixlist: idlist,
          };
          
          boardCache.setTotalCache(req.params.title, ret);
  
          res.send(ret);
        } else {
          let ret = {
            aaData: list,
            fixlist: [],
          };
          
          boardCache.setTotalCache(req.params.title, ret);
        }
      }
    }
  }
}

/*
Author: 우림
첫번째 리스트 가져오기
*/

async function getFirstList(req, res) {
  res.send(boardCache.getFirstList(req.params.title));
}

/*
Author: Yunji
Function: getBoardList = title에 해당하는 게시글 list 가져 오기
*/
/*
async function getBoardList(req, res) {
  // title에 해당하는 보드를 가지고 온다.
  const board = await models.Board.findOne({
    where: {
      title: req.params.title,
    },
  });
  // console.log("보드",board);

  // 위에서 그 보드 게시판을 제대로 가지고 오면.
  if (board) {
    const postList = [];
    const fixedPosts = [];

    const today = new Date();

    // 상단 공지 5개 가져오기
    const posts = await models.BoardPost.findAll({
      where: {
        BoardId: board.id,
        fixDate: {
          gt: today,
        },
      },
      include: [{
        model: models.User,
      },
      {
        model: models.Faculty,
      }],
      order: [
        ['id', 'DESC'],
      ],
      limit: 5,
    });
    console.log(posts);
    // posts에서 받아온 것을 가지고... 상단 공지 5개에 대한 보내기
    if (posts) {
      await posts.forEach(async (post) => {
        // 제목 길면 ... 붙여주기.
        post.title = post.title.length > 30 ? `${post.title.substring(0, 30)}...` : post.title.substring(0, 30);

        // 상단고정 따로 처리?
        await fixedPosts.push(post.id);

        await postList.push({
          // 이건또왜있지?
          index: '공지',
          id: post.id,
          // 이건 왜있지?
          title: postTitle,
          category: post.category,
          views: post.views,
          time: moment(post.createdAt).format('YYYY-MM-DD'),
          fixDate: post.fixDate,
          prof: post.Faculty.name,
          name: post.User.name,
        });
      });
    }

    // 상단 공지 아닌 게시물들 가져오기
    const data = await models.BoardPost.findAll({
      where: {
        BoardId: board.id,
      },
      include: [{
        model: models.User,
      },
      {
        model: models.Faculty,
      }],
      order: [
        ['id', 'DESC'],
      ],
    });

    // posts에서 받아온 것을 가지고... 상단 공지 5개에 대한 보내기
    let index = await data[0].length;
    await data.forEach((post) => {
      // 제목 길면 ... 붙여주기.
      post.title = post.title.length > 30 ? `${post.title.substring(0, 30)}...` : post.title.substring(0, 30);
      index -= 1;
      post.index = index;
      post.time = moment(post.time).format('YYYY-MM-DD');

      postList.push(post);
    });

    res.send({
      aaData: postList,
    });
  }
}
*/

/*
Author: ByeongNam
Function: getBoardPost = title에 해당하는 게시글 중 id에 해당하는 post 가져 오기
*/
async function getBoardPost(req, res) {
  // 보내는 거 자체가 존재
  if (req.params.title === 'gallery') {
    this.data = await models.BoardPost.findOne({
      where: {
        id: req.params.id,
      },
      attributes: [
        'id',
        'title',
        'category',
        'text',
        'views',
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('BoardPost.time'), '%Y-%m-%d'), 'time'],
        'BoardId',
        [Sequelize.fn('IFNULL', Sequelize.col('User.name'), '해당 없음'), 'Username'],
        [Sequelize.fn('IFNULL', Sequelize.col('Professor.name'), '해당 없음'), 'Facultyname'],
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('BoardPost.fixDate'), '%Y-%m-%d'), 'fixDate'],
      ],
      include: [{
        model: models.Professor,
        attributes: ['id'],
      },
      {
        model: models.User,
        attributes: [],
      },
      {
        model: models.BoardFile,
        attributes: ['id', 'name', 'path', 'type', 'size', 'downs'],
        offset: 0,
        limit: 5,
        order: ['id', 'ASC'],
      }],
    });
  } else {
    this.data = await models.BoardPost.findOne({
      where: {
        id: req.params.id,
      },
      attributes: [
        'id',
        'title',
        'category',
        'text',
        'views',
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('BoardPost.createdAt'), '%Y-%m-%d'), 'time'],
        'BoardId',
        [Sequelize.fn('IFNULL', Sequelize.col('User.name'), '해당 없음'), 'Username'],
        [Sequelize.fn('IFNULL', Sequelize.col('Professor.name'), '해당 없음'), 'Facultyname'],
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('BoardPost.fixDate'), '%Y-%m-%d'), 'fixDate'],
      ],
      include: [{
        model: models.Professor,
        attributes: ['id'],
      },
      {
        model: models.User,
        attributes: [],
      },
      {
        model: models.BoardFile,
        attributes: ['id', 'name', 'path', 'type', 'size', 'downs'],
        offset: 0,
        limit: 5,
        order: ['id', 'ASC'],
      }],
    });
  }
  if (this.data) {
    const task = [
      async () => {
        const prev = await models.BoardPost.findOne({
          attributes: ['id'],
          offset: 0,
          limit: 1,
          order: 'id',
          where: {
            BoardId: this.data.BoardId,
            id: {
              gt: req.params.id,
            },
          },
        });
        return prev;
      },
      async () => {
        const next = await models.BoardPost.findOne({
          attributes: ['id'],
          offset: 0,
          limit: 1,
          order: [
            ['id', 'DESC'],
          ],
          where: {
            BoardId: this.data.BoardId,
            id: {
              lt: req.params.id,
            },
          },
        });
        return next;
      },
    ];
    async.parallel(task,
      async (err, values) => {
        if (err) {
          res.send({
            result: false,
          });
        } else {
          await this.data.increment('views', { by: 1, where: { id: data.id } });
          // 조회수 view 올리기 기능.
          this.data.views += 1;
          boardCache.increaseView(req.params.title, data.id);
          res.send({
            result: true,
            post: this.data,
            prev: values[0],
            next: values[1],
          });
        }
      });
  } else {
    res.send({
      result: false
    });
  }
}

/*
Author: Yunji
Function: getBoardPost = title에 해당하는 게시글 중 id에 해당하는 post 가져 오기
*/
/* async function getBoardPost(req, res) {
  // title에 해당하는 보드를 가지고 온다.
    // board가 존재하면, board post 정보 다 가져오기.
  if (board) {
    const data = await models.BoardPost.findOne({
      where: {
        BoardId: board.id,
        id: req.params.id,
      },
    });

    async.parallel({
      // prev 함수로 선언.
      async prev(callback) {
        const prev = await models.BoardPost.findOne({
          attributes: [['id', 'post']],
          offset: 0,
          limit: 1,
          order: 'id',
          where: {
            BoardId: board.id,
            id: {
              gt: data.id,
            },
          },
        });

        if (prev[0][0]) {
          callback(null, prev[0][0]);
        } else {
          callback(null, null);
        }
      },
      async next(callback) {
        const next = await models.BoardPost.findOne({
          attributes: [['id', 'post']],
          offset: 0,
          limit: 1,
          order: [
            ['id', 'DESC'],
          ],
          where: {
            BoardId: board.id,
            id: {
              lt: data.id,
            },
          },
        });

        if (next[0][0]) callback(null, next[0][0]);
        else callback(null, null);
      },
      async files(callback) {
        let files = await models.BoardFile.findAll({
          attributes: ['name', 'path', 'type', 'size', 'downs'],
          offset: 0,
          limit: 5,
          order: 'id',
          where: {
            BoardId: board.id,
            BoardPostId: data[0].id,
          },
        });

        // files = files[0];
        [files] = files;
        if (files) {
          files.forEach(async (file) => {
            file.link = `/ajax/board/file/download/${board.title}/${path.basename(file.path)}`;
            delete file.path;
          });
          callback(null, files);
        } else {
          callback(null, null);
        }
      },
    },
    async (err, results) => {
      await data.increment('views', { by: 1 });
      // 조회수 view 올리기 기능.
      data.time = moment(data.time).format('YYYY-MM-DD');
      data.views += 1;
      data.files = results.files;

      res.send({
        result: true,
        post: data,
        prev: results.prev,
        next: results.next,
      });
    });
    // async.parallel 끝
  } else {
    next();
  }
} */

/*
Author: Yunji
Function: deleteBoardPost = title에 해당하는 게시글 중 id에 해당하는 post를 삭제한다.
*/
async function deleteBoardPost(req, res) {
  boardCache.validateCache(req.params.title);
  
  const board = await models.Board.findOne({
    where: {
      title: req.params.title,
    },
    include: [{
      model: models.BoardPost,
      where: {
        id: req.params.id,
      },
    }],
  });
  // if (board !== null && board.BoardPosts[0]) {
  if (board && board.BoardPosts[0]) {
    const boardpost = board.BoardPosts[0];
    // 삭제 권한 확인
    if (req.session.user.id !== 1) {
      res.send({
        result: false,
        text: '본인 또는 관리자만이 삭제할 수 있습니다.',
      });
    } else {
      // 권한이 맞으면 삭제.
      boardpost.destroy();
      res.send({
        result: true,
      });
    }
  } else {
    next();
  }
}

/*
Author: KoHyunsu
Function: file_name에 해당하는 파일을 저장한다.
*/
async function downFile(req, res) {
  const boardfile = await models.BoardFile.findOne({
    where: { id: req.params.file_id }
  });
  if (boardfile) {
    const filePath = boardfile.path.replace('/webdata', 'webdata');
    if (boardfile.path === '0') {
      res.send({ result: false, text: 'path is null' });
    } else {
      res.download(filePath);
    }
  } else {
    res.send({ result: false, text: 'path is null' });
  }
}

/*
Author: Yunji
Function: downFile = file_name에 해당하는 file을 저장한다.
*/
/* async function downFile(req, res) {
  if (board !== null && board.BoardFiles[0]) {
    const boardfile = await board.BoardFiles[0];
    boardfile.downs += 1;
    if (boardfile.save()) {
      res.download(boardfile.path);
    }
  } else next();
} */
/*
Author: Yunji
Function: deleteFile = file_name에 해당하는 file을 삭제한다.
*/
/*
async function deleteFile(req, res) {
  const board = await models.Board.findOne({
    where: {
      title: req.params.title,
    },
    include: [{
      model: models.BoardFile,
      where: {
        path: path.join(config.path.upload_path, req.params.title, req.params.file_name),
      },
    }],
  });

  if (board !== null && board.BoardFiles[0]) {
    const boardfile = board.BoardFiles[0];
    // 권한이 없으면.
    if (boardfile.UserId !== req.session.user.id && req.session.user.id !== 1) {
      res.send({
        result: false,
        text: '본인 또는 관리자만이 삭제할 수 있습니다.',
      });
    } else {
      const boardpost = await models.BoardPost.findOne({
        where: {
          id: boardfile.BoardPostId,
        },
      });

      req.body.thumbPath = null;
      await boardpost.updateAttributes(req.body);

      if (fs.existsSync(boardfile.path)) {
        console.log('file exist');
        fs.unlinkSync(boardfile.path);
      } else {
        console.log('file not exist');
      }
      // 권한이 있으니까 삭제.
      const del = await boardfile.destroy();
      if (del) {
        res.send({
          result: true,
        });
      } else {
        res.send({
          result: false,
        });
      }
    }
  }
}
*/
/*
Author: ByeongNam
Function: deleteFile = file_name에 해당하는 file을 삭제한다.
*/
async function deleteFile(req, res) {
  const file = await models.BoardFile.findOne({
    where: {
      id: req.params.file_id,
    }
  });
  console.log(file.path);
  if (fs1.existsSync('.'+file.path)) {
    console.log('file exist');
    fs1.unlinkSync('.'+file.path);
  } else {
    console.log('file not exist');
  }
  const del = await file.destroy();
  if (del) {
    res.send({
      result: true,
    });
  } else {
    res.send({
      result: false,
    });
  }
}
module.exports = {
  getBoardList, getFirstList, addBoardPost, addImage, getBoardPost, modifyBoardPost, deleteBoardPost, downFile, deleteFile,
};
