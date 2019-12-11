module.exports = (sequelize, DataTypes) => {
  const Newsletter = sequelize.define('Newsletter', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true,
      autoIncrement: true
    },
    edition: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'newsletter',
    comment: '뉴스레터',
  });

  Newsletter.associate = (models) => {
    Newsletter.hasMany(models.Newscontent, { foreignkey: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  };

  return Newsletter;
};
