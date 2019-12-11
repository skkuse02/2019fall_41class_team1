module.exports = (sequelize, DataTypes) => {
  const ClassificationData = sequelize.define('ClassificationData', {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
			autoIncrement: true,
			comment: 'id',
      primaryKey: true,
    },
    result: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '결과',
    },
  }, {
    tableName: 'classification_data',
    comment: '유저 음식',
  });

  ClassificationData.associate = function(models) {
    models.ClassificationData.belongsTo(models.Classification, {
      foreignKey: "cid",
      onUpdate: 'cascade',
      onDelete: 'cascade',
    });
  };
  return ClassificationData;
};
