var express = require('express');
var router = express.Router();
const models = require('../models');

/* GET users listing. */
router.get('/:id', async function(req, res) {
    var user = await models.User.findOne({
        where: {
            id: req.params.id
        }
    });
    if(user) {
        res.send({
            result: true,
            data: user
        });
    } else {
        res.send({
            result: false
        })
    }
});

router.post('/', async function(req, res) {
    await models.User.create({
        id: req.body.id,
        name: req.body.name
    });
    res.send({
        result: true
    });
});

module.exports = router;
