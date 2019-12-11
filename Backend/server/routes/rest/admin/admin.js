const models = require('../../../models');

/*
Author: Cho Kun Hee
Function: 유저 로그인
*/
async function loginUser(req, res) {
  const user = await models.User.findOne({ // 유저 검색
    where: {
      uid: req.body.uid,
      password: req.body.pwd
    }
	});

  if (user !== null) {
    req.session.user = user;
    user.time = new Date();
    user.ip = req.session.ip;
    req.session.user.time = user.time; // 세션 추가 등록
    req.session.user.ip = user.ip;
    req.session.user.id = user.id;
    req.session.user.name = user.name;
    req.session.user.level = user.level;
    delete req.body.pwd;
    res.send({ // 로그인 결과 response
			result: true,
			data: req.session.user
    });
  } else {
    res.send({
      result: false
    });
  }
}

/*
  Author: Cho Kun Hee
  Function: 유저 로그아웃
  */
async function logoutUser(req, res) {
  req.session.user = {};
  delete req.session.user;
  res.redirect('/');
}

module.exports = {
  loginUser,
  logoutUser
};
