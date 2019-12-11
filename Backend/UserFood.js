module.exports = (sequelize, DataTypes) => {
  const UserFood = sequelize.define('UserFood', {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
			autoIncrement: true,
			comment: 'id',
    },
  }, {
    tableName: 'userfood',
    comment: '유저 음식',
    classMethods: {
      associate(models) {
        UserFood.belongsTo(models.User);
        UserFood.belongsTo(models.Food);
      },
    },
  });
  return UserFood;
};
