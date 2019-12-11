module.exports = function (sequelize, DataTypes) {
  const Professor = sequelize.define('Professor', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    perId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '교수님 사번',
    },
    department: {
      type: DataTypes.INTEGER,
      defaultValue: '0',
      comment: '전공 -> 일반전임: 1, 교육전담: 2, 명예교수: 3, 석좌교수: 4, 대우교수: 5, 산학교수: 6, 초빙교수: 7, 겸임교수: 8, 연구교수: 9'
    },
    locate: {
      type: DataTypes.INTEGER,
      comment: '목록 위치'
    },
    position: {
      type: DataTypes.STRING,
      defaultValue: '',
      comment: '교수, 부교수 등'
    },
    appointment: {
      type: DataTypes.STRING,
      defaultValue: '',
      comment: '직위'
    },
    university: {
      type: DataTypes.STRING,
      defaultValue: '',
      comment: '학위 수여교'
    },
    email: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    phone: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    research: {
      type: DataTypes.STRING,
      defaultValue: '',
      comment: '연구 주제'
    },
    introduction: {
      type: DataTypes.TEXT,
      comment: '연구 소개'
    },
    lab: {
      type: DataTypes.STRING,
      defaultValue: '',
      comment: '연구실'
    },
    lab_homepage: {
      type: DataTypes.STRING,
      defaultValue: '',
      comment: '연구실 링크'
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '', // 이부분 나중에 디폴드 이미지 생기면 넣어주기
      comment: '사진'
    },
    ppt: {
      type: DataTypes.STRING,
      defaultValue: '', // 이부분 나중에 디폴드 이미지 생기면 넣어주기
      comment: '연구 주제 이미지'
    }
  }, {
    tableName: 'professor',
    comment: '전공 교수'
  });
  return Professor;
};
