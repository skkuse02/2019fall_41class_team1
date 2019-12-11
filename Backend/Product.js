module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
			type: DataTypes.INTEGER,
			unique: true,
			allowNull: false,
			autoIncrement: true,
			comment: 'id',
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			comment: '이름',
		},
		price: {
			type: DataTypes.INTEGER,
			allowNull: false,
			comment: '가격',
		},
		photo: {
			type: DataTypes.STRING,
			allowNull: false,
			comment: '사진',
		},
  }, {
    tableName: 'product',
    comment: '상품',
    classMethods: {
      associate(models) {
        Product.belongsTo(models.Food);
        Product.hasMany(models.Order);
      },
    },
  });
  return Product;
};
