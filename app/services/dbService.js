const { uuid } = require('uuidv4');
const Pool = require('pg').Pool;
require('dotenv').config();
var bcrypt = require("bcryptjs");

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
    return new Date(date).toLocaleString().split(',')[0]
}

formatRawLeagues = (userById) => {
    let leagues = [];

    userById.league_.map(league => {
        const leagueDetails = userById.leaguedetails.filter(element => element.league_id === league);
        const shouldDisplayDecks = isDeckRevealDateInPast(leagueDetails[0].deck_reveal_date)
        const registrants = leagueDetails.map(registrant => {
            return {
                email: registrant.email,
                deck_id: registrant.deck_id,
                deck_name: registrant.user_id === userById.id ?
                    registrant.deck_name : shouldDisplayDecks ? registrant.deck_name : null,
                deck_url: registrant.user_id === userById.id ?
                    registrant.deck_url : shouldDisplayDecks ? registrant.deck_url : null,
                user_id: registrant.user_id
            }
        })

        const sortedRegistrants = registrants.sort((a) => {
            if (a.user_id !== leagueDetails[0].admin_id) {
                return 1
            }
            else {
                return -1
            }
        })

        leagues.push({
            id: league,
            name: leagueDetails[0].name,
            admin_id: leagueDetails[0].admin_id,
            start_date: leagueDetails[0].start_date ? formatDate(leagueDetails[0].start_date) : null,
            end_date: leagueDetails[0].end_date ? formatDate(leagueDetails[0].end_date) : null,
            deck_reveal_date: leagueDetails[0].deck_reveal_date ? formatDate(leagueDetails[0].deck_reveal_date) : null,
            registrants: sortedRegistrants,
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
                `SELECT users.email,leagues.name,leagues.admin_id,league_registrations.*,seasons.start_date,seasons.end_date, seasons.deck_reveal_date,decks.deck_name,decks.deck_url
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
                console.log(error);
                return { message: "Failed to get league details" };
            }
        }
        const leagues = formatRawLeagues(userById.rows[0]);
        try {
            const decks = await pool.query(`SELECT * FROM decks WHERE user_id=${id}`);
            userById.rows[0].decks = decks.rows;
            userById.rows[0].decksForSubmission = decks.rows.map(deck => {
                return {
                    label: deck.deck_name,
                    value: deck.id
                }
            })
        } catch (err) {
            console.log(err);
            return { message: "Failed to get decks" };
        }

        userById.rows[0].leagues = leagues;
        delete userById.rows[0].league_;
        delete userById.rows[0].leaguedetails;
        // console.log(userById.rows[0].leagues[0].registrants)
        return userById.rows[0];
    } catch (err) {
        console.log(err);
        return { message: "Failed to get user by id" };
    }
}

createUserByGoogleProfile = async (googleId, email) => {
    try {
        const res = await pool.query(
            'INSERT INTO users (google_id,email) VALUES ($1,$2) RETURNING *',
            [googleId, email]
        );
        return res.rows[0];
    } catch (error) {
        console.log(error);
        return { error: "Unable to create user. Please try again" };
    }
}

submitDeck = async (userId, deckName, deckUrl, deckPrice) => {
    console.log('at submit deck');
    const randInt = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)
    try {
        const res = await pool.query(
            'INSERT INTO decks (id,user_id,deck_name,deck_url,deck_price) VALUES ($1,$2,$3,$4,$5) RETURNING *',
            [randInt, userId, deckName, deckUrl, deckPrice]
        );
        return res.rows[0];
    } catch (error) {
        console.log(error);
        return { error: "Unable to create user. Please try again" };
    }
}

registerLeagueDeck = async (userId, deckDetails) => {
    const limitingCharacteIndex = deckDetails.indexOf("-");
    const leagueId = deckDetails.substring(0, limitingCharacteIndex);
    const deckId = deckDetails.substring(limitingCharacteIndex + 1, 100);

    try {
        const res = await pool.query(
            `UPDATE league_registrations SET deck_id = ${deckId} WHERE league_id=${leagueId} AND user_id=${userId}`
        );
        return true;
    } catch (error) {
        console.log(error);
        return { error: "Unable to register league deck. Please try again" };
    }
}

updateShirtPrice = async (colors, quantity, price) => {
    try {
        const res = await pool.query(
            `UPDATE shirtprices SET price = ${price} WHERE colors=${colors} AND quantity='${quantity}'`
        );
        if (res) {
            return true;
        }
    } catch (error) {
        console.log(error);
        return { error: "Unable to register league deck. Please try again" };
    }
}

updateEmbroideryPrice = async (stitches, quantity, price) => {
    try {
        const res = await pool.query(
            `UPDATE embroideryshirtprices SET price = ${price} WHERE stitches='${stitches}' AND quantity='${quantity}'`
        );
        if (res) {
            return true;
        }
    } catch (error) {
        console.log(error);
        return { error: "Unable to register league deck. Please try again" };
    }
}

createUserWithPassword = async (email, password) => {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);

    try {
        const res = await pool.query(
            'INSERT INTO users (email,password) VALUES ($1,$2) RETURNING *',
            [email, hash]
        );
        return res.rows[0];
    } catch (error) {
        console.log(error);
        return { error: "Unable to create user. Please try again" };
    }
}

getUserByEmail = async (email) => {
    try {
        const res = await pool.query(
            `SELECT * FROM users WHERE users.email='${email}'`
        );
        return res.rows[0];
    } catch (err) {
        console.log(err);
        return err.stack;
    }
}

checkPassword = async (dbPassword, inputPassword) => {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(inputPassword, salt);
    var passwordIsValid = bcrypt.compareSync(
        dbPassword,
        inputPassword
    );

    if (passwordIsValid) {
        return true;
    }
    else {
        return false;
    }
}

const dbService = {
    getUserById: getUserById,
    getUserByGoogleId: getUserByGoogleId,
    createUserByGoogleProfile: createUserByGoogleProfile,
    createLeague: createLeague,
    joinLeague: joinLeague,
    getLeagueById: getLeagueById,
    submitDeck: submitDeck,
    registerLeagueDeck: registerLeagueDeck,
    updateShirtPrice: updateShirtPrice,
    updateEmbroideryPrice: updateEmbroideryPrice,
    createUserWithPassword: createUserWithPassword,
    getUserByEmail: getUserByEmail,
    checkPassword: checkPassword
};
module.exports = dbService;
