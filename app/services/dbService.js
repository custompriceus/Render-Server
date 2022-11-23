const { uuid } = require('uuidv4');
const Pool = require('pg').Pool;
require('dotenv').config();

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl: true
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

getUserByGoogleId = async (googleId) => {
    try {
        const res = await pool.query(
            `SELECT id FROM users WHERE users.google_id='${googleId}'`
        );
        return res.rows[0];
    } catch (err) {
        console.log(err);
        return err.stack;
    }
}

getUserById = async (id) => {
    const leaguesByUserIdString =
        `SELECT a.id,a.google_id,a.email, ARRAY_REMOVE(ARRAY_AGG (b.league_id),NULL) as league_ FROM users a FULL OUTER JOIN league_registrations b ON a.id = b.user_id WHERE a.id='${id}' GROUP BY a.id ORDER BY a.id;`

    try {
        let userById = await pool.query(leaguesByUserIdString);
        if (userById.rows[0] && userById.rows[0].league_ && userById.rows[0].league_.length > 0) {
            const leaguesArray = userById.rows[0].league_;

            const leagueDetailsByLeagueIdString =
                `SELECT users.email,leagues.id,leagues.name FROM leagues FULL OUTER JOIN league_registrations ON leagues.id = league_registrations.league_id FULL OUTER JOIN users on league_registrations.user_id = users.id WHERE leagues.id IN (${leaguesArray})`

            try {
                const leagueDetails = await pool.query(leagueDetailsByLeagueIdString);
                if (leagueDetails && leagueDetails.rows) {
                    userById.rows[0].leaguedetails = leagueDetails.rows;
                }
            } catch (error) {
                console.log(err);
                return { message: "Failed to get league details" };
            }
        }
        return userById.rows[0]
    } catch (err) {
        console.log(err);
        return { message: "Failed to get user by id" };
    }
}

createUserByGoogleProfile = async (googleId, email) => {
    const roles = [];

    try {
        const res = await pool.query(
            'INSERT INTO users (google_id,email) VALUES ($1,$2) RETURNING *',
            [googleId, email]
        );
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

const dbService = {
    getUserById: getUserById,
    getUserByGoogleId: getUserByGoogleId,
    createUserByGoogleProfile: createUserByGoogleProfile,
    createLeague: createLeague
};
module.exports = dbService;
