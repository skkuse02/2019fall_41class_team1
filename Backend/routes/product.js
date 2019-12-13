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
        pid: req.body.pid
    });

    res.send({
        result: true
    });
});

router.get('/order/:id', async function(req,res) {
    var order = await models.Order.findAll({
        where: {
            uid: req.params.id
        },
        include: {
            model: models.Product
        }
    });

    res.send({
        result: true,
        data: order
    });
});

module.exports = router;
