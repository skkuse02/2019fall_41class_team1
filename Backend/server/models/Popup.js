module.exports = function (sequelize, DataTypes) {
  const Popup = sequelize.define('Popup', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    text: {
      type: DataTypes.TEXT,
      comment: '(내용 컬럼인데 타이틀만 필요하면 지우기)'
    },
    start: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '팝업 시작 시간'
    },
    end: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '팝업 종료 시간'
    },
    path: {
      type: DataTypes.STRING,
      // allowNull: false,
      comment: '업로드한 이미지 경로 또는 파일명'
    },
    height: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '100%',
      comment: '높이 : px or %'
    },
    width: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '100%',
      comment: '넓이 : px or %'
    },
    link: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'popup',
    comment: '팝업'
  });
  return Popup;
};
