module.exports = (sequelize, DataTypes) => {
  const BoardPost = sequelize.define('BoardPost', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
    },
    time: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    ip: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    fixDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '게시판 상단 고정 여부와 기한',
    },
    main: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '메인 노출 여부',
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '공지사항 카테고리',
    },
    ProfessorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '교수님 사번',
    },
    BoardId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'board_post',
    comment: '게시판 게시물'
  });

  BoardPost.associate = (models) => {
    BoardPost.belongsTo(models.User);
    BoardPost.belongsTo(models.Board);
    BoardPost.belongsTo(models.Professor);
    BoardPost.hasMany(models.BoardFile, { foreignkey: 'id', onDelete: 'CASCADE' });
  };

  return BoardPost;
};
