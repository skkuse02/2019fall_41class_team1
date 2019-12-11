const aa = require('express-async-await');
const express = require('express');
const upload = require('../../../config/upload.js');

const router = aa(express.Router());

const {
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
} = require('./professor');

router.get('/list/all', getProfList);
router.get('/list/lab', getProfListWithLab);


router.post('/write', upload, writeProf);
router.get('/view/:id', getProfOne);
router.post('/modify/:id', upload, modifyProf);
router.post('/delete/:id', deleteProf);
router.post('/file/delete/:id', deleteProfile);
router.get('/file/photo/:id', getProfPhoto);
router.post('/file/photo/delete/:id', deletePhoto);
router.get('/file/research/:id', getProfResearchPhoto);
router.post('/file/research/delete/:id', deleteResearch);
router.get('/dept/all', getProf3);
router.get('/dept/:dept', getProf2);


module.exports = router;
