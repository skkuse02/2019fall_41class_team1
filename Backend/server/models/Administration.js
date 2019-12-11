module.exports = (sequelize, DataTypes) => {
  const Administration = sequelize.define('Administration', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    position: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    phone: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    email: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    listorder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    comment: {
      type: DataTypes.TEXT,
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '',
    },
  }, {
    tableName: 'administration',
    comment: '행정실 업무분장',
  });
  return Administration;
};
