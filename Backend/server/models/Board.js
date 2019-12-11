module.exports = (sequelize, DataTypes) => {
  const Board = sequelize.define('Board', {
    title: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    comment: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    category: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '게시판 카테고리 사용 유무',
    },
  }, {
    tableName: 'board_list',
    comment: '게시판 분류',
  });

  Board.associate = (models) => {
    Board.hasMany(models.BoardPost);
    Board.hasMany(models.BoardFile);
  };

  return Board;
};
