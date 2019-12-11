module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
			comment: '카카오ID',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '이름',
    },
    token: {
      type: DataTypes.INTEGER,
      allowNull: false,
			defaultValue: 0,
      comment: '토큰',
    },
		calories: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 0,
			comment: '칼로리',
		},
		fiber: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 0,
			comment: '식이섬유',
		},
		calcium: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 0,
			comment: '칼슘',
		},
		iron: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 0,
			comment: '철분',
		},
		sodium: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 0,
			comment: '나트륨',
		},
		vitaminA: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 0,
			comment: '비타민A',
		},
  }, {
    tableName: 'user',
    comment: '유저',
    classMethods: {
      associate(models) {
        User.hasMany(models.UserFood);
        User.hasMany(models.Recommendation);
        User.hasMany(models.Order);
      },
    },
  });
  return User;
};
