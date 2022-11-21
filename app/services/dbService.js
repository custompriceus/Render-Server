const db = require("../models");
const User = db.user;
const League = db.league;

getUserByGoogleId = async (googleId) => {
    try {
        return await User.findOne({
            where: {
                google_id: googleId
            },
            include: League
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
            },
            include: League
        })

    } catch (error) {
        console.log(error)
        return { error: "Invalid user detected. Please try again" };
    }
}

createLeague = async (userId, leagueName) => {
    console.log('at db service create league');

    const league = await League.create({
        creator_id: userId,
        admin_id: userId,
        name: leagueName,
        userId: userId
    })
    if (league) {
        return league.setUsers(userId)
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
    createUserByGoogleProfile: createUserByGoogleProfile,
    createLeague: createLeague
};
module.exports = dbService;
