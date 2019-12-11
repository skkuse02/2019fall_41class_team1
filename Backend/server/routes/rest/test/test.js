const models = require('../../../models');

async function tt(req,res) {
	res.send({
		result: true
	});
}

module.exports = {
  tt,
};
