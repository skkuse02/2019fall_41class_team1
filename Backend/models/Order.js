module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
			type: DataTypes.INTEGER,
			unique: true,
			allowNull: false,
			autoIncrement: true,
			comment: 'id',
        primaryKey: true,
		},
  }, {
    tableName: 'order',
    comment: '주문',
  });

    Order.associate = function(models) {
        models.Order.belongsTo(models.User, {
            foreignKey: "uid",
            onUpdate: 'cascade',
            onDelete: 'cascade',
        });
        models.Order.belongsTo(models.Product, {
            foreignKey: "pid",
            onUpdate: 'cascade',
            onDelete: 'cascade',
        });
    };
  return Order;
};
