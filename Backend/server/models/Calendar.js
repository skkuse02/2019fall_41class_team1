module.exports = (sequelize, DataTypes) => {
  const Calendar = sequelize.define('Calendar', {
    startdate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    enddate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    contents: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'calendar',
    comment: '학사일정',
  });
  return Calendar;
};
