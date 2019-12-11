module.exports = (sequelize, DataTypes) => {
  const Newscontent = sequelize.define('Newscontent', {
    text: {
      type: DataTypes.STRING
    },
  }, {
    tableName: 'newscontent',
    comment: '뉴스레터 소식'
  });
  return Newscontent;
};
