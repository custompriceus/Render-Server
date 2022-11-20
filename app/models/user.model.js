module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    google_id: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    }
  },
    {
      timestamps: false
    });

  return User;
};
