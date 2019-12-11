var express = require('express');
var router = express.Router();
const models = require('../models');

router.get('/list/:id', async function(req,res) {
    var list = await models.Product.findAll({
        where: {
            fid: req.params.id
        }
    });

    res.send({
        result: true,
        data: list
    });
});

router.get('/item/:id', async function(req,res) {
    var item = await models.Product.findOne({
        where: {
            id: req.params.id
        }
    });

    res.send({
        result: true,
        data: item
    });
});

router.post('/order', async function(req,res) {
    await models.Order.create({
        uid: req.body.uid,
        pid: req.body.fid
    });

    res.send({
        result: true
    });
});

module.exports = router;
