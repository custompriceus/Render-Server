module.exports = (sequelize, Sequelize) => {
    const Deck = sequelize.define("decks", {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING
        }
    },
        {
            timestamps: false
        });

    return Deck;
};
