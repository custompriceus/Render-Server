const { uuid } = require('uuidv4');
const Pool = require('pg').Pool;
require('dotenv').config();

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

createLeague = async (userId, leagueName) => {
    try {
        const res = await pool.query(
            'INSERT INTO leagues (id,name,creator_id,admin_id) VALUES ($1,$2,$3,$4) RETURNING *',
            [uuid(), leagueName, userId, userId]
        );
        const res2 = await pool.query(
            'INSERT INTO leagueregistrations (id,user_id,league_id) VALUES ($1,$2,$3) RETURNING *',
            [uuid(), userId, res.rows[0].id]
        );
        return res2.rows[0];
    } catch (err) {
        console.log(err);
        return err.stack;
    }
};

getUserByGoogleId = async (id) => {
    try {
        const res = await pool.query(
            `SELECT * FROM users WHERE google_id ='${id}'`
        );
        return res.rows[0];
    } catch (err) {
        console.log(err);
        return err.stack;
    }
}

getUserById = async (id) => {
    try {
        const res = await pool.query(
            `SELECT * FROM users WHERE id ='${id}'`
        );
        pool.query(queryString, [], (error, results) => {
            if (error) {
                console.log('error');
                throw error;
            }
            return results.rows;
        });

    } catch (error) {
        console.log(error);
        return { error: "Invalid user detected. Please try again" };
    }
}

createUserByGoogleProfile = async (googleId, email) => {
    const roles = [];

    try {
        const res = await pool.query(
            'INSERT INTO users (google_id,email) VALUES ($1,$2) RETURNING *',
            [googleId, email]
        );
        console.log(res);
        return res.rows[0];

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

    } catch (error) {
        console.log(error);
        return { error: "Unable to create user. Please try again" };
    }
}
// createUserByGoogleProfile = async (googleId, email) => {
//     const roles = [];

//     try {
//         const user = await User.create({
//             google_id: googleId,
//             email: email
//         })

//         // if (roles) {
//         //   Role.findAll({
//         //     where: {
//         //       name: {
//         //         [Op.or]: req.body.roles
//         //       }
//         //     }
//         //   }).then(roles => {
//         //     user.setRoles(roles).then(() => {
//         //       return user;
//         //     });
//         //   });
//         // } else {
//         //   // user role = 1
//         //   user.setRoles([1]).then(() => {
//         //     return user;
//         //   });
//         // }
//         return user;
//     } catch (error) {
//         return { error: "Unable to create user. Please try again" };
//     }
// }

const dbService = {
    getUserById: getUserById,
    getUserByGoogleId: getUserByGoogleId,
    createUserByGoogleProfile: createUserByGoogleProfile,
    createLeague: createLeague
};
module.exports = dbService;
