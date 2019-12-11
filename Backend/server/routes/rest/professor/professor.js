const async = require('async');
const axios = require('axios');
const fs = require('async-file');
const mkdirp = require('async-mkdirp');
const path = require('path');
const map = require('async/map');
const profNumbers = require('./profNumbers');
const models = require('../../../models');
const config = require('../../../config/config.json')[process.env.NODE_ENV || 'development'];

/*
Author: Park Eunchan
Function: 교수님 성함 입력하면 해당 교수님 데이터 전송.
*/
/*async function getProf(req, res) {
  if (profNumbers[req.params.name]) {
    const profData = await axios.get(`https://skb.skku.edu/api/professor/getProfessorInfo.do?perId=${profNumbers[req.params.name]}`);
    const response = {};
    if (profData.data.rData) {
      response.name = profData.data.rData.korName;
      response.email = profData.data.rData.email;
      response.labUrl = profData.data.rData.urlHome;
      response.labName = profData.data.rData.labNm;
      res.send(response);
    } else {
      res.send({
        result: false
      });
    }
  } else {
    res.send({
      result: false
    });
  }
}*/

/* Author: Park Eunchan
Function: 교수 사진 가져오기 */

async function getProfPhoto(req, res) {
  const profData = await models.Professor.findOne({
    where: {
      id: req.params.id
    },
    attributes: ['photo']
  });
  res.download(`${config.path.upload_path}professor/${profData.photo}`);
}

/* Author: Park Eunchan
Function: 교수 연구사진 가져오기 */
async function getProfResearchPhoto(req, res) {
  const profData = await models.Professor.findOne({
    where: {
      id: req.params.id
    },
    attributes: ['ppt']
  });

  res.download(path.join(`${config.path.upload_path}/professor/`, profData.ppt));
}
/* Author: Park Eunchan
Function: 교수 사진 삭제 */
async function deletePhoto(req, res) {
  const Prof = await models.Professor.findOne({
    where: {
      id: req.params.id
    },
    attributes: ['photo']
  });

  if (Prof.photo !== '') {
    await models.Professor.update({
      photo: ''
    }, {
      where: {
        id: req.params.id
      }
    });
  }
  res.send({
    result: true
  });
}

async function deleteResearch(req, res) {
  const Prof = await models.Professor.findOne({
    where: {
      id: req.params.id
    },
    attributes: ['ppt']
  });

  if (Prof.ppt !== '') {
    await models.Professor.update({
      ppt: ''
    }, {
      where: {
        id: req.params.id
      }
    });
  }
  res.send({
    result: true
  });
}

async function getProf(req, res) {
  const profData = await models.Professor.findOne({
    where: {
      id: req.params.id,
    },
    attributes: ['name', 'email', 'lab', 'lab_homepage'],
  });
  res.send(profData);
}

/*
Author: Ko Hyunsu
Function: 교수님 '성함 | 랩' 형식으로 데이터 전송.
# 참고사항: forEach 반복문의 경우 await가 먹히지 않기 때문에 forEach 내부에 따로 res.send를 처리해줘야 함. i 쓰는 거 극혐임...
*/
/*
async function getProfListWithLab(req, res) {
  let i = 0;
  profList = [];
  profList.push('해당 없음');
  const profName = Object.keys(profNumbers);
  profName.forEach(async (name, index, array) => {
    const profData = await axios.get(`https://skb.skku.edu/api/professor/getProfessorInfo.do?perId=${profNumbers[name]}`);
    if (profData.data.success && profData.data.rData.labNm) {
      const profForm = `${name} | ${profData.data.rData.labNm}`; profList.push(profForm);
    } else if (profData.data.success && profData.data.rData.labNmEn) {
      const profForm = `${name} | ${profData.data.rData.labNmEn}`; profList.push(profForm);
    } else {
      profList.push(name);
    }
    i += 1;
    if (i === array.length) res.send({ result: profList });
  });
}
*/

/*
Author: Ko Hyunsu
Function: 교수님 '성함 | 랩' 형식으로 데이터 전송.
# 참고사항: 반복문 안에 await가 필요한 경우 forEach 대신 map이나 reduce를 쓰고 return 값에 Promise를 반환할 것을 추천함.
*/
async function getProfListWithLab(req, res) {
  profList = [];
  profList.push('해당 없음');
  const profName = Object.keys(profNumbers);

  const promise = await Promise.all(profName.map(async (name) => {
    const profData = await axios.get(`https://skb.skku.edu/api/professor/getProfessorInfo.do?perId=${profNumbers[name]}`);
    if (profData.data.success && profData.data.rData.labNm) {
      const profForm = `${name} | ${profData.data.rData.labNm}`;
      return Promise.resolve(profForm);
    }
    return Promise.resolve(name);
  }));

  if (promise) {
    profList = profList.concat(promise);
    res.send({ result: profList });
  } else {
    res.send({ result: false });
  }
}

/*
Author: Kim Byeong Nam
Function: 교수이름불러오기(board 작성할때 사용)
차피 교수 이름, 사번, id는 디비에 따로 저장되어 있기 때문에
jason파일에서 안불러와도 됨. 디비에서 가져와서 보내주면됨. 
*/
async function getProfList(req, res) {
  const namelist = await models.Professor.findAll({
    attributes: ['id', 'name'],
  });
  res.send(
    namelist
  );
}

/*
Author: Cho Kun Hee
Function: 교수 department 값에 따라 교수들 불러오는 api(교수보여주는 페이지에서 사용)
*/
async function getProf2(req, res) {
  const data = await models.Professor.findAll({
    where: {
      department: req.params.dept
    },
    attributes: ['id', 'photo', 'name', 'position', 'research', 'lab', 'lab_homepage', 'ppt']
  });
  res.send(data);
}

/*
Author: Cho Kun Hee
Function 교수 모두 불러오는 api(교수 모두 보여주는 페이지에서 사용) 
*/
async function getProf3(req, res) {
  const data = await models.Professor.findAll({
    attributes: ['id', 'photo', 'name', 'position', 'research', 'lab', 'lab_homepage', 'ppt']
  });
  res.send(data);
}


/*
Author: Cho Kun Hee
Function: 파일 저장 그리고 파일 이름 돌려줌
*/
async function makefileName(file) {
  if (!(file.isFileSizelimit)) {
    let fileName = Date.now();
    fileName += '-';
    fileName += file.originalname;
    const filePath = await path.join(config.path.upload_path, 'professor', fileName);
    await mkdirp(path.join(config.path.upload_path, 'professor'));
    await fs.rename(file.path, filePath); // 파일 저장
    return `${fileName}`;
  }
  return false;
}


/*
Author: Cho Kun Hee
Function: 특정 교수 세부사항 불러오기
*/
async function writeProf(req, res, next) {
  // 교수 작성하기
  let department_sum = 0;
  req.body.department.forEach((i) => {
    i = Number(i);
    department_sum += i;
  });

  req.body.department = department_sum;
  req.body.photo = '';
  req.body.ppt = '';

  // file case 설정하기

  let file_case = 0;
  req.files.length == 2 ? file_case = 1
  : req.files.length == 1 && req.files[0].fieldname == 'file_1' ? file_case = 2
  : req.files.length == 1 && req.files[0].fieldname == 'file_2' ? file_case = 3
  : next();

  if (file_case !== 0 && file_case !== 3) {
    if (file_case === 1) {
      const result1 = await makefileName(req.files[0]); // photo 파일 이름 생성 및 저장
      const result2 = await makefileName(req.files[1]); // ppt

      req.body.photo = result1;
      req.body.ppt = result2;
      await models.Professor.create(req.body);
      res.send({ result: true });
    } else if (file_case === 2) {
      const result3 = await makefileName(req.files[0]);
      req.body.photo = result3;
      await models.Professor.create(req.body);
      res.send({ result: true });
    } else { // 필요는 없지만 혹시 모르니
      res.send({
        result: false
      });
    }
  } else {
    res.send({
      result: false,
      message: 'no photo file'
    });
  }
}


/*
Author: Cho Kun Hee
Function: 특정 교수 세부사항 불러오기
*/
async function getProfOne(req, res) {
  const Prof_data = await models.Professor.findOne({
    where: { id: req.params.id },
    // attributes: []
  });
  res.send({
    result: true,
    post: Prof_data.dataValues
  });
}

async function modifyProf(req, res) {
  let flag1 = -1, flag2 = -1;
  if( req.files.lenth !== 0){
    req.files.forEach((i, n) => {
      if(i.fieldname === "file1"){
        flag1 = n;
      }
      if(i.fieldname === "file2"){
        flag2 = n;
      }
    });
    if(flag1 !== -1) {
      req.body.photo = await makefileName(req.files[flag1]);
    }
    if(flag2 !== -1) {
      req.body.ppt = await makefileName(req.files[flag2]);
    }
  }
  
  await models.Professor.update(req.body, {
    where: { id: req.params.id }
  });
  res.send({ result: true });
}
/*
Author: Cho Kun Hee
Function: 교수 세부사항 변경
*/
/*async function modifyProf(req, res) {
  // 교수 작성하기
  let department_sum = 0;
  req.body.department.forEach((i) => {
    i = Number(i);
    department_sum += i;
  });

  req.body.department = department_sum;
  req.body.photo = '';
  req.body.ppt = '';

  // file case 설정하기

  let file_case = 0;
  req.files.length == 2 ? file_case = 1
  : req.files.length == 1 && req.files[0].fieldname == 'file_1' ? file_case = 2
  : req.files.length == 1 && req.files[0].fieldname == 'file_2' ? file_case = 3
  : next();


  if (file_case !== 0 && file_case !== 3) {

    if (file_case === 1) {
      const result1 = await makefileName(req.files[0]); // photo 파일 이름 생성 및 저장
      const result2 = await makefileName(req.files[1]); // ppt

      req.body.photo = result1;
      req.body.ppt = result2;
      await models.Professor.update(req.body, {
        where: { id: req.params.id }
      });
      res.send({ result: true });
    } else if (file_case === 2) {
      const result3 = await makefileName(req.files[0]);
      req.body.photo = result3;
      await models.Professor.update(req.body, {
        where: { id: req.params.id }
      });
      res.send({ result: true });
    } else { // 필요는 없지만 혹시 모르니
      res.send({
        result: false
      });
    }
  } else {
    res.send({
      result: false,
      message: 'no photo file'
    });
  }
}*/

/*
Author: Cho Kun Hee
Function: 특정 교수 세부사항 삭제
*/
async function deleteProf(req, res) {
  await models.Professor.destroy({ where: { id: req.params.id } });

  res.send({ result: true });
}


/*
Author: Cho Kun Hee
Function: 교수 파일 삭제
*/
async function deleteProfile(req, res) {
  const Prof = await models.Professor.findOne({
    where: {
      id: req.params.id
    },
    attributes: ['photo', 'ppt']
  });
  const photoPath = Prof.photo;
  const pptPath = Prof.ppt;

  // 나중에 req.session.user 파악 하기

  if (photoPath !== '') {
    // fs.unlinkSync(photoPath); 파일 삭제... 왜 안될까
    await models.Professor.update({
      photo: ''
    }, {
      where: {
        id: req.params.id
      }
    });
  }

  if (pptPath !== '') {
    // fs.unlinkSync(pptPath);
    await models.Professor.update({
      ppt: ''
    }, {
      where: {
        id: req.params.id
      }
    });
  }
  res.send({
    result: true
  });
}

module.exports = {
  getProf,
  getProfList,
  getProfListWithLab,
  writeProf,
  getProfOne,
  modifyProf,
  deleteProf,
  deleteProfile,
  getProf2,
  getProf3,
  getProfPhoto,
  getProfResearchPhoto,
  deleteResearch,
  deletePhoto
};
