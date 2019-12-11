module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
			type: DataTypes.INTEGER,
			unique: true,
			allowNull: false,
			autoIncrement: true,
			comment: 'id',
		},
  }, {
    tableName: 'order',
    comment: '주문',
    classMethods: {
      associate(models) {
        Order.belongsTo(models.User);
        Order.belongsTo(models.Product);
      },
    },
  });
  return Order;
};
