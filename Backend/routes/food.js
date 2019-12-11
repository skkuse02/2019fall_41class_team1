var express = require('express');
var router = express.Router();
const models = require('../models');
var multer = require('multer');
var vision = require('@google-cloud/vision');

var _storage = multer.diskStorage({
    destination: function(req,file,cb) {
        cb(null,'public/images/')
    },
    filename: function(req,file,cb) {
        cb(null,new Date().valueOf() + file.originalname);
    }
});
var upload = multer({storage: _storage});

/* GET users listing. */
router.post('/image', upload.single('image'), async function(req,res) {
    var client = new vision.ImageAnnotatorClient();

    var [result] = await client.labelDetection('public/images/'+req.file.filename);
    const labels = result.labelAnnotations;

    //classification 등록
    var classification = await models.Classification.create({
        image: req.file.filename
    });

    // 라벨 검색
    var counter = 0;
    var data = [];

    for(const label of labels) {
        var food = await models.Food.findOne({
            where: {
                name: label.description
            }
        });

        console.log(food);

        if(food) {
            var container = {};
            container['cid'] = classification.id;
            container['result'] = label.description;
            data[counter++] = container;
        }
    }

    if(counter === 0) {
        res.send({
            result: false
        })
    } else {
        await models.ClassificationData.bulkCreate(data);

        res.send({
            result: true,
            id: classification.id
        });
    }
});

router.get('/data/:id', async function(req,res) {
    var data = await models.ClassificationData.findAll({
        where: {
            cid: req.params.id
        }
    });

    res.send({
        result: true,
        data: data
    })
});

router.post('/upload', async function(req,res) {
    var food = await models.Food.findOne({
        where: {
            name: req.body.result
        }
    });

    var classification = await models.Classification.findOne({
        where: {
            id: req.body.cid
        }
    });

    await models.UserFood.create({
        uid: req.body.id,
        fid: food.id,
        image: classification.image
    });

    res.send({
        result: true
    });
});

router.get('/:id', async function(req,res) {
    var userfood = await models.UserFood.findAll({
        where: {
            uid: req.params.id
        }
    });

    if(userfood.length) {
        res.send({
            result: true,
            data: userfood
        });
    } else {
        res.send({
            result: false
        })
    }
});

module.exports = router;
