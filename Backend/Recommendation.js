module.exports = (sequelize, DataTypes) => {
  const Recommendation = sequelize.define('Recommendation', {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
			autoIncrement: true,
			comment: 'id',
    },
  }, {
    tableName: 'recommendation',
    comment: '추천',
    classMethods: {
      associate(models) {
        Recommendation.belongsTo(models.User);
        Recommendation.belongsTo(models.Food);
      },
    },
  });
  return Recommendation;
};
