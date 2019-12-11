const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');
const cron = require('node-cron');
const models = require('../../../models');

// Calendar를 위해서 moment의 Weekday 명칭을 한국어로 바꿔주기
moment.updateLocale('en', {
  weekdaysShort: ['일', '월', '화', '수', '목', '금', '토']
});

/*
Author: KoHyunsu
Function: https://www.skku.edu/skku/edu/bachelor/ca_de_schedule.do 에서 학사일정 데이터 크롤링 + 매일 새벽 3시마다 업데이트
# 데이터를 리스트 하나에 모으는 효율성을 위해 reduce 함수를 사용하였습니다.
*/
cron.schedule('0 3 * * *', async () => {
  // 1. skku.edu에서 학사일정 데이터 가져오기

  // 1.1 axios.get 요청으로 학사일정 html 가져오기
  const url = 'https://www.skku.edu/skku/edu/bachelor/ca_de_schedule.do';
  const response = await axios.get(url);
  if (response.status === 200) {
    const html = response.data;

    // 1.2 cheerio 모듈 사용해서 가져온 html을 text로, 다시 json으로 가공하기
    const $ = cheerio.load(html);
    const text = $('textarea').text();
    const json = JSON.parse(text);


    // 2. json <-> list 변환하기

    // 2.1 yearList - reduce 함수(1차)로 월별로 구분되어 있던
    // 데이터 'json'을 데이터 'list'로 변환하기 (나중에 vue에서 for문 쓰기 편하게 하기 위함.)
    let yearList = Object.values(json).reduce((List, val) => {
      const monthJson = Object.values(val[0]);

      // 2.2 monthList - reduce 함수(2차)로 date, contents가 뭉뜽그러져 있던(?)
      // 데이터 'list'를 데이터 'json'으로 변환하기 (나중에 vue에서 렌더링 편하게 하기 위함.)
      const monthList = monthJson.reduce((list, valval, index) => {
        dateData = {};
        if (index % 3 === 2) {
          dateData.startdate = `${monthJson[index - 2]} 00:00:00`;
          dateData.enddate = `${monthJson[index - 1]} 23:59:59`;
          dateData.contents = `${monthJson[index]}`;
          list.push(dateData);
        }
        return list;
      }, []);

      List = List.concat(monthList);
      return List;
    }, []);

    // 2.의 최종 결과물 dateData(json) -> monthList(일시적으로 쓰이는 중개 list) -> yearList(list)

    // 3. yearList 날짜순으로 정렬 (startdate 먼저 비교 후, 같다면 enddate 비교)
    yearList = yearList.sort((a, b) => {
      if (a.startdate > b.startdate) return 1;
      if (a.startdate === b.startdate && a.enddate > b.enddate) return 1;
      if (a.startdate === b.startdate && a.endate < b.enddate) return -1;
      return -1;
    });

    // 4. Calendar DB 모두 리셋 후 새로 업데이트
    await models.Calendar.destroy({ truncate: true });
    await Promise.all(yearList.map(async (y) => {
      const calendar = await models.Calendar.create({
        startdate: y.startdate,
        enddate: y.enddate,
        contents: y.contents
      });
      return Promise.resolve(calendar);
    }));
  }
}, { timezone: 'Asia/Seoul' });

/*
Author: KoHyunsu
Function: https://www.skku.edu/skku/edu/bachelor/ca_de_schedule.do 에서 학사일정 데이터 크롤링.
# cron이 작동하지 않을 경우 대비한 비상용 함수
*/
async function crawlingCalendarData(req, res) {
  // 1. skku.edu에서 학사일정 데이터 가져오기

  // 1.1 axios.get 요청으로 학사일정 html 가져오기
  const url = 'https://www.skku.edu/skku/edu/bachelor/ca_de_schedule.do';
  const response = await axios.get(url);
  if (response.status === 200) {
    const html = response.data;

    // 1.2 cheerio 모듈 사용해서 가져온 html을 text로, 다시 json으로 가공하기
    const $ = cheerio.load(html);
    const text = $('textarea').text();
    const json = JSON.parse(text);


    // 2. json <-> list 변환하기

    // 2.1 yearList - reduce 함수(1차)로 월별로 구분되어 있던
    // 데이터 'json'을 데이터 'list'로 변환하기 (나중에 vue에서 for문 쓰기 편하게 하기 위함.)
    let yearList = Object.values(json).reduce((List, val) => {
      const monthJson = Object.values(val[0]);

      // 2.2 monthList - reduce 함수(2차)로 date, contents가 뭉뜽그러져 있던(?)
      // 데이터 'list'를 데이터 'json'으로 변환하기 (나중에 vue에서 렌더링 편하게 하기 위함.)
      const monthList = monthJson.reduce((list, valval, index) => {
        dateData = {};
        if (index % 3 === 2) {
          dateData.startdate = `${monthJson[index - 2]} 00:00:00`;
          dateData.enddate = `${monthJson[index - 1]} 23:59:59`;
          dateData.contents = `${monthJson[index]}`;
          list.push(dateData);
        }
        return list;
      }, []);

      List = List.concat(monthList);
      return List;
    }, []);

    // 2.의 최종 결과물 dateData(json) -> monthList(일시적으로 쓰이는 중개 list) -> yearList(list)

    // 3. yearList 날짜순으로 정렬 (startdate 먼저 비교 후, 같다면 enddate 비교)
    yearList = yearList.sort((a, b) => {
      if (a.startdate > b.startdate) return 1;
      if (a.startdate === b.startdate && a.enddate > b.enddate) return 1;
      if (a.startdate === b.startdate && a.endate < b.enddate) return -1;
      return -1;
    });

    res.send({ result: true, post: yearList });
  } else {
    res.send({ result: false });
  }
}

/*
Author: JuneHee
Function: getCaledarData = 학사일정 전부 가져오기.
*/
async function getCalendarData(req, res) {
  const calendar = await models.Calendar.findAll({
    order: [['startdate', 'ASC']],
  });
  calendar.forEach((data) => {
    data.dataValues.startdate = `${moment(data.startdate).format('MM.DD')}(${moment(data.startdate).format('ddd')})`;
    data.dataValues.enddate = `${moment(data.enddate).format('MM.DD')}(${moment(data.enddate).format('ddd')})`;
  });
  res.send({ result: calendar });
}
/*
Author: JuneHee
Function: deleteCalendarData = 일정 삭제
*/
async function deleteCalendarData(req, res) {
  const delcal = await models.Calendar.destroy({
    where: {
      id: req.params.id,
    },
  });
  if (delcal) {
    res.send({ result: true });
  } else {
    res.send({ result: false });
  }
}
/*
Author: JuneHee
Function: addCalendarData = 일정 추가
*/
async function addCalendarData(req, res) {
  const addcal = await models.Calendar.create(req.body);
  if (addcal) {
    res.send({ result: true });
  } else {
    res.send({ result: false });
  }
}
/*
Author: JuneHee
Function: modifyCalendarData = 일정 수정
*/
async function modifyCalendarData(req, res) {
  const getid = await models.Calendar.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (getid) {
    const modcal = await getid.updateAttributes(req.body);
    if (modcal) {
      res.send({ result: true });
    } else {
      res.send({ result: false });
    }
  } else {
    res.send({ result: false });
  }
}

module.exports = {
  getCalendarData,
  deleteCalendarData,
  addCalendarData,
  modifyCalendarData,
  crawlingCalendarData,
};
