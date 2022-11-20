const db = require("../models");
const User = db.user;

getUserByGoogleId = async (googleId) => {
    try {
        return await User.findOne({
            where: {
                google_id: googleId
            }
        })
    } catch (error) {
        return { error: "Invalid user detected. Please try again" };
    }
}

getUserById = async (id) => {
    try {
        return await User.findOne({
            where: {
                id: id
            }
        })
    } catch (error) {
        return { error: "Invalid user detected. Please try again" };
    }
}

createUserByGoogleProfile = async (googleId, email) => {
    const roles = [];

    try {
        const user = await User.create({
            google_id: googleId,
            email: email
        })

        // if (roles) {
        //   Role.findAll({
        //     where: {
        //       name: {
        //         [Op.or]: req.body.roles
        //       }
        //     }
        //   }).then(roles => {
        //     user.setRoles(roles).then(() => {
        //       return user;
        //     });
        //   });
        // } else {
        //   // user role = 1
        //   user.setRoles([1]).then(() => {
        //     return user;
        //   });
        // }
        return user;
    } catch (error) {
        return { error: "Unable to create user. Please try again" };
    }
}

const dbService = {
    getUserById: getUserById,
    getUserByGoogleId: getUserByGoogleId,
    createUserByGoogleProfile: createUserByGoogleProfile
};
module.exports = dbService;
