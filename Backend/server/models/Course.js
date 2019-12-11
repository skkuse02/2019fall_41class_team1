module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    section: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '학부, 일반대학원',
    },
    major: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '주관 학과',
    },
    degree: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '학사, 학사/석사, 석사, 석사/박사, 박사',
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '전공(대학원), 전공기반, 전공심화, 실험실습',
    },
    credit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '학점',
    },
    subject_name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '과목명',
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '과목 설명',
    },
  }, {
    tableName: 'course',
    comment: '교육과정',
  });
  return Course;
};
