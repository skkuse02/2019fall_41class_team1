'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

// tunnel config
var tunnel = require('tunnel-ssh');

var tconfig = {
  username: 'pi',
  password: 'rubicscube213',
  host: 'jhrabbit.iptime.org',
  port: 10122,  //접속할 리눅스ssh포트

  dstHost: '127.0.0.1',  //최종목적지(내가 접속 할 데이터베이스)
  dstPort: 3306,        //최종목적지에서 사용할 포트(내가 접속 할 데이터베이스 포트)
  localPort: 22000       //ssh가 접속후 사용할 가상포트번호
};

// initiate tunnel

tunnel(tconfig, function (error, server) {
  //....
  if(error) {
    console.error(error);
  } else {
    console.log('server:', server);
    // test sequelize connection
    sequelize.authenticate().then(function(err) {
      console.log('connection established');
    }).catch(function(err) {
      console.error('unable establish connection', err);
    })
  }
})

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Food = require('./Food')(sequelize, Sequelize);
db.Order = require('./Order')(sequelize, Sequelize);
db.Product = require('./Product')(sequelize, Sequelize);
db.Recommendation = require('./Recommendation')(sequelize, Sequelize);
db.User = require('./User')(sequelize, Sequelize);
db.UserFood = require('./UserFood')(sequelize, Sequelize);
db.Classification = require('./Classification')(sequelize, Sequelize);
db.ClassificationData = require('./ClassificationData')(sequelize, Sequelize);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
