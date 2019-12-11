module.exports = (sequelize, DataTypes) => {
  const Classification = sequelize.define('Classification', {
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
    tableName: 'classification',
    comment: '유저 음식',
  });

  return Classification;
};
