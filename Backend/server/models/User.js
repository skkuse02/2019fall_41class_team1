module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    uid: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      comment: 'Sequelize id 컬럼이랑 네이밍 중복되서 uid로 함',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '이름',
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'sha256 hash 사용, 생성시 http://www.xorbin.com/tools/sha256-hash-calculator 참조',
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '권한',
    },
  }, {
    tableName: 'user',
    comment: '유저',
    classMethods: {
      associate(models) {
        User.hasMany(models.BoardPost);
      },
    },
  });
  return User;
};
