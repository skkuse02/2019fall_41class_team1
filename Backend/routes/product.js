var express = require('express');
var router = express.Router();
const models = require('../models');
var request = require('request');

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

    var product = await models.Product.findOne({
        where: {
            id: req.body.pid
        }
    });

    var user = await models.User.findOne({
        where: {
            id: req.body.uid
        }
    });

    var option = {
        url: 'https://api.luniverse.io/tx/v1.1/transactions/transfer',
        method: 'POST',
        form: {
            "from": "0xda73503f818dbba5716bb3dc414bd1ac393feb8f",
            "inputs": {
                "receiverAddress": "0xb4ae74322b3ab45c2588690ae6e7da1ad4a9f6fe",
                "valueAmount": String(product['price'])+"000000000000000000"
            }
        },
        headers: {
            "Authorization": "Bearer iRJsA2VY2oXDbXsbHvWisgqjNo5rBpJyxbNKd9jpBn2pF8tQuQWCpD2Dh1oBYqTf",
            "Content-Type": "application/json"
        },
        json: true
    };

    request(option);

    await models.User.update({
        token: user.token - product['price']
    }, {
        where: {
            id: req.body.uid
        }
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
