// 필요 모듈 임포트
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');
const timeout = require('connect-timeout');
const session = require('express-session');
const multer = require('multer');
const moment = require('moment');
const history = require('connect-history-api-fallback');
const ejs = require('ejs');

const app = express();
const proxy = require('express-http-proxy');


const config = require('./config/config.json')[process.env.NODE_ENV || 'development'];

const viewPath = config.path;

// 뷰 엔진 셋업
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

// express 환경 셋업
app.use(timeout('30s'));
app.use(logger((app.get('env') === 'development' ? 'dev' : 'default')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());

app.use('/', express.static(path.join(__dirname, '/../static'))); // static 폴더 static 라우팅


app.use('/webdata', express.static(path.join(__dirname, '/../webdata')));
app.use(compression());

/*
app.use(multer({
  dest: './webdata_tmp/', // 업로드된 파일 임시경로
  // inMemory: true,
  limits: {
    fileSize: 1024 * 1024 * 50, // 업로드 용량 50메가 제한(20메가에서 수정함)
    //        files: 1, // 파일, 필드, 파트도 1메가 제한
    //        fields: 1,
    //        parts: 1
  },
onFileSizeLimit: function (file) {
  try {
    fs.unlinkSync(file.path);
  } catch (err) { }
  file.isFileSizeLimit = true;
  return file;
  }
}).any());
*/

// 뷰 엔진 셋업 ( 세션 떄문에 )
/*
app.use(function(req, res, next) { // 이거 iccsys 로그인 된 모든페이지 렌더링에서 session 값 가져오려는건데 엄청 비효율적일수도 있음
    ejs.setDefaults({
        cache: false,
        locals: {
            env: app.get('env'),
            session: function() {
                return req.session;
            }
        }
    });
    next();
});
*/

// 컨트롤러 라우팅 셋업
// app.use('/', require('./routes/index'));

// routes 폴더에 명시된 라우팅 먼저 확인
app.use('/rest', require('./routes/rest/main')); // main.js, index.js를 main 폴더에 옮김 참고할 것
app.use('/rest/admin', require('./routes/rest/admin'));
app.use('/rest/professor', require('./routes/rest/professor'));
app.use('/rest/course', require('./routes/rest/course'));
app.use('/rest/calendar', require('./routes/rest/calendar'));
app.use('/rest/news_letter', require('./routes/rest/newsletter'));
app.use('/rest/board', require('./routes/rest/board'));
app.use('/rest/administration', require('./routes/rest/administration'));
app.use('/rest/page', require('./routes/rest/page'));
app.use('/rest/popup', require('./routes/rest/popup'));

app.use(history());

if (process.env.proxy == 'false') {
  app.use('/', express.static(path.join(__dirname, viewPath.index)));
}

if (process.env.proxy == 'true') {
  app.use('/', proxy('localhost:8001'));
}

// / error handlers

// / catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      title: 'error'
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: {},
    title: 'error'
  });
});

/*
models.sequelize.sync({
    //
});
*/

module.exports = app;
