module.exports = (sequelize, Sequelize) => {
    const League = sequelize.define("leagues", {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING
        },
        creator_id: {
            type: Sequelize.UUID,
        },
        admin_id: {
            type: Sequelize.UUID,
        }
    },
        {
            timestamps: false
        });

    return League;
};
