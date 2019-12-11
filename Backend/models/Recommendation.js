module.exports = (sequelize, DataTypes) => {
  const Recommendation = sequelize.define('Recommendation', {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
			autoIncrement: true,
			comment: 'id',
      primaryKey: true,
    },
  }, {
    tableName: 'recommendation',
    comment: '추천',
  });

  Recommendation.associate = function(models) {
    models.Recommendation.belongsTo(models.User, {
      foreignKey: "uid",
      onUpdate: 'cascade',
      onDelete: 'cascade',
    });
    models.Recommendation.belongsTo(models.Food, {
      foreignKey: "fid",
      onUpdate: 'cascade',
      onDelete: 'cascade',
    });
  };
  return Recommendation;
};
