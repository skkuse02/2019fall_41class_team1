var express = require('express');
var router = express.Router();
const models = require('../models');

router.get('/:id', async function(req,res) {
    var recommendation = await models.Recommendation.findOne({
        where: {
            uid: req.params.id
        },
        order: [
            ['createdAt','DESC']
        ]
    });

    if(recommendation) {
        var food = await models.Food.findOne({
            where: {
                id: recommendation.fid
            }
        });

        res.send({
            result: true,
            id: food.id,
            name: food.name
        });
    } else {
        res.send({
            result: false
        })
    }
});

module.exports = router;
