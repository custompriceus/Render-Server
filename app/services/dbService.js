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

getLeagueById = async (leagueId) => {
    try {
        const res = await pool.query(
            `SELECT id FROM leagues WHERE leagues.id='${leagueId}'`
        );
        return res.rows[0];
    } catch (err) {
        console.log(err);
        return false;
    }
};

createLeague = async (userId, leagueName, seasonId = 1) => {
    try {
        const randInt = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)
        const res = await pool.query(
            'INSERT INTO leagues (id,name,creator_id,admin_id) VALUES ($1,$2,$3,$4) RETURNING *',
            [randInt, leagueName, userId, userId]
        )
        const randInt2 = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)
        await pool.query(
            'INSERT INTO league_registrations (id, user_id,league_id,season_id) VALUES ($1,$2,$3,$4) RETURNING *',
            [randInt2, userId, res.rows[0].id, seasonId]
        );

        return res.rows[0];
    } catch (err) {
        console.log(err);
        return false;
    }
};

joinLeague = async (userId, leagueId, seasonId = 1) => {
    try {
        const randInt = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)
        const res = await pool.query(
            'INSERT INTO league_registrations (id, user_id,league_id,season_id) VALUES ($1,$2,$3,$4) RETURNING *',
            [randInt, userId, leagueId, seasonId]
        );
        return res.rows[0];
    } catch (err) {
        console.log(err);
        return false;
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

const isDeckRevealDateInPast = (deckRevealDate) => {
    return (new Date(Date.parse(deckRevealDate)) < new Date(Date.now()))
}

const formatDate = (date) => {
    let dateObj = new Date();
    const month = dateObj.getUTCMonth(date) + 1;
    const day = dateObj.getUTCDate(date);
    const year = dateObj.getUTCFullYear(date);

    const newDate = month + "/" + day + "/" + year;
    return newDate;
}

formatUserById = (userById) => {
    let leagues = [];

    userById.league_.map(league => {
        const leagueDetails = userById.leaguedetails.filter(element => element.league_id === league);
        const registrants = leagueDetails.map(registrant => {
            return {
                email: registrant.email,
                deck_id: registrant.deck_id,
                deck_name: registrant.deck_name,
                url: registrant.url,
                user_id: registrant.user_id
            }
        })
        leagues.push({
            id: league,
            name: leagueDetails[0].name,
            admin_id: leagueDetails[0].admin_id,
            start_date: leagueDetails[0].start_date ? formatDate(leagueDetails[0].start_date) : null,
            end_date: leagueDetails[0].end_date ? formatDate(leagueDetails[0].end_date) : null,
            deck_reveal_date: leagueDetails[0].deck_reveal_date ? formatDate(leagueDetails[0].deck_reveal_date) : null,
            registrants: registrants,
            shouldDisplayDecks: isDeckRevealDateInPast(leagueDetails[0].deck_reveal_date)
        })
    })
    return leagues;
}

getUserById = async (id) => {
    const leaguesByUserIdString =
        `SELECT a.id,a.email, ARRAY_REMOVE(ARRAY_AGG (b.league_id),NULL) as league_ FROM users a FULL OUTER JOIN league_registrations b ON a.id = b.user_id WHERE a.id='${id}' GROUP BY a.id ORDER BY a.id;`

    try {
        let userById = await pool.query(leaguesByUserIdString);
        if (userById.rows[0] && userById.rows[0].league_ && userById.rows[0].league_.length > 0) {
            const leaguesArray = userById.rows[0].league_;

            const leagueDetailsByLeagueIdString =
                `SELECT users.email,leagues.name,leagues.admin_id,league_registrations.*,seasons.start_date,seasons.end_date, seasons.deck_reveal_date,decks.name AS deck_name,decks.url
                FROM leagues
                FULL OUTER JOIN league_registrations ON leagues.id = league_registrations.league_id
                FULL OUTER JOIN users on league_registrations.user_id = users.id
                FULL OUTER JOIN seasons on leagues.id = seasons.league_id 
                FULL OUTER JOIN decks on league_registrations.deck_id = decks.id
                WHERE leagues.id IN (${leaguesArray})`

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
        const leagues = formatUserById(userById.rows[0]);

        userById.rows[0].leagues = leagues;
        delete userById.rows[0].league_;
        delete userById.rows[0].leaguedetails;
        return userById.rows[0];
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
    createLeague: createLeague,
    joinLeague: joinLeague,
    getLeagueById: getLeagueById
};
module.exports = dbService;
