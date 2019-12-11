module.exports = (sequelize, DataTypes) => {
  const UserFood = sequelize.define('UserFood', {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
			autoIncrement: true,
			comment: 'id',
      primaryKey: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '사진',
    },
  }, {
    tableName: 'userfood',
    comment: '유저 음식',
  });

  UserFood.associate = function(models) {
    models.UserFood.belongsTo(models.User, {
      foreignKey: "uid",
      onUpdate: 'cascade',
      onDelete: 'cascade',
    });
    models.UserFood.belongsTo(models.Food, {
      foreignKey: "fid",
      onUpdate: 'cascade',
      onDelete: 'cascade',
    });
  };
  return UserFood;
};
