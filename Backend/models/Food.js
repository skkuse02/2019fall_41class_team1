module.exports = (sequelize, DataTypes) => {
    const Food = sequelize.define('Food', {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            allowNull: false,
            autoIncrement: true,
            comment: 'id',
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: '이름',
        },
        calories: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
            comment: '칼로리',
        },
        fiber: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
            comment: '식이섬유',
        },
        calcium: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
            comment: '칼슘',
        },
        iron: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
            comment: '철분',
        },
        sodium: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
            comment: '나트륨',
        },
        vitaminA: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
            comment: '비타민A',
        },
    }, {
        tableName: 'food',
        comment: '음식',
    });
    return Food;
};
