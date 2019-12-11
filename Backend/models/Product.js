module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
			type: DataTypes.INTEGER,
			unique: true,
			allowNull: false,
			autoIncrement: true,
			comment: 'id',
		primaryKey: true,
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
		image: {
			type: DataTypes.STRING,
			allowNull: false,
			comment: '사진',
		},
  }, {
    tableName: 'product',
    comment: '상품',
  });

	Product.associate = function(models) {
		models.Product.belongsTo(models.Food, {
			foreignKey: "fid",
			onUpdate: 'cascade',
			onDelete: 'cascade',
		});
	};
  return Product;
};
