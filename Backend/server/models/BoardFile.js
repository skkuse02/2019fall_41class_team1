module.exports = (sequelize, DataTypes) => {
  const BoardFile = sequelize.define('BoardFile', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '업로드한 원래 파일명'
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '저장한 경로 또는 파일명'
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    downs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'board_file',
    comment: '게시판 게시물 첨부 파일'
  });

  BoardFile.associate = (models) => {
    BoardFile.belongsTo(models.User);
    BoardFile.belongsTo(models.Board);
  };

  return BoardFile;
};
