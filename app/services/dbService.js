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
    ssl: {
    rejectUnauthorized: false
  }
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

getUserByGoogleIdOld = async (googleId) => {
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

getUserByGoogleId = async (googleId) => {
    try {
        const res = await pool.query(
            `SELECT id FROM testusers WHERE testusers.google_id='${googleId}'`
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

getUserByIdOld = async (id) => {
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

getUserById = async (id) => {
    try {
        const res = await pool.query(
            `SELECT email,id FROM testusers WHERE testusers.id='${id}'`
        );
        return res.rows[0];
    } catch (err) {
        console.log(err);
        return err.stack;
    }
}

createUserByGoogleProfileOld = async (googleId, email) => {
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

createUserByGoogleProfile = async (googleId, email) => {
    try {
        const res = await pool.query(
            'INSERT INTO testusers (google_id,email) VALUES ($1,$2) RETURNING *',
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
    var hash = bcrypt.hashSync(password, 10);

    try {
        const res = await pool.query(
            'INSERT INTO testusers (email,password) VALUES ($1,$2) RETURNING *',
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

getUserByEmail = async (email) => {
    try {
        const res = await pool.query(
            `SELECT * FROM testusers WHERE testusers.email='${email}'`
        );
        return res.rows[0];
    } catch (err) {
        console.log(err);
        return err.stack;
    }
}

checkPassword = async (dbPassword, inputPassword) => {
    var passwordIsValid = bcrypt.compareSync(inputPassword, dbPassword,
    );

    if (passwordIsValid) {
        return true;
    }
    else {
        return false;
    }
}

getShirtPrices = async () => {
    try {
        const res = await pool.query(
            `SELECT * FROM shirtprices`
        );
        return res.rows;
    } catch (err) {
        console.log(err);
        return err.stack;
    }
}

getEmbroideryPrices = async () => {
    try {
        const res = await pool.query(
            `SELECT * FROM embroideryshirtprices`
        );
        return res.rows;
    } catch (err) {
        console.log(err);
        return err.stack;
    }
}
saveScreenCharge = async (screenCharge) => {
    try {
        const res = await pool.query(
            `INSERT INTO settings (key, value) VALUES ('screenCharge', $1)
                ON CONFLICT (key) DO UPDATE SET value = $1;`,
                [screenCharge]
        );
         console.log("DB Save Success:", res.rows[0]); // Log the result
        return res.rows[0];
    } catch (error) {
        console.log(error);
        return { error: "Unable to connect Setting " };
    } 
}
getScreenCharge = async () => {
    try {
        const res = await pool.query( 
               `SELECT value FROM settings WHERE key = 'screenCharge'`
        );
       
        return res.rows[0];
    } catch (err) {
        console.log(err);
        return err.stack;
    }
}
// saveMaterialData = async (field1,field2,field3,field4) => {
//     try {
//          // Save field1 → field3
//         await pool.query(
//             `INSERT INTO settings (key, value)
//              VALUES ($1, $2)
//              ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`,
//             [field1, field2]
//         );

//         // Save field2 → field4
//         await pool.query(
//             `INSERT INTO settings (key, value)
//              VALUES ($1, $2)
//              ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`,
//             [field3, field4]
//         );

//         return { success: true };
//     } catch (error) {
//         console.error(error);
//         return { error: "Unable to save material settings." };
//     }
// }

saveMaterialData = async (materials) => {
  try {
    // 1️⃣ Delete group entries and blank keys first
    await pool.query(
      `DELETE FROM settings 
       WHERE key IN ('Nylon, Poly, Mesh, Jersey', 'Legs, Sweats, Sleeves',' Sleeves') 
          OR key IS NULL 
          OR TRIM(key) = ''`
    );

    // 2️⃣ Remove duplicates and trim keyss
    const uniqueMaterialsMap = new Map();
    for (const { key, value } of materials) {
      if (!key || key.trim() === "") continue; // skip blank keys
      uniqueMaterialsMap.set(key.trim(), value); // overwrite duplicates
    }

    // 3️⃣ Insert or update the unique materials
    for (const [key, value] of uniqueMaterialsMap.entries()) {
      await pool.query(
        `INSERT INTO settings (key, value)
         VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`,
        [key, value]
      );
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Unable to save material settings." };
  }
};



getMaterialData = async () => {
    try {
        const res = await pool.query(
               `SELECT value,key FROM settings where key !='screenCharge'   AND key NOT IN ('Nylon, Poly, Mesh, Jersey', 'Legs, Sweats, Sleeves')`
        );
       
        return res.rows;
    } catch (err) {
        console.log(err);
        return err.stack;
    }
}

const dbService = {
    getUserByIdOld: getUserByIdOld,
    getUserById: getUserById,
    getUserByGoogleIdOld: getUserByGoogleIdOld,
    getUserByGoogleId: getUserByGoogleId,
    createUserByGoogleProfileOld: createUserByGoogleProfileOld,
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
    getUserByEmail: getUserByEmail,
    checkPassword: checkPassword,
    getShirtPrices: getShirtPrices,
    getEmbroideryPrices: getEmbroideryPrices,
    saveScreenCharge:saveScreenCharge,
    getScreenCharge:getScreenCharge,
    getMaterialData:getMaterialData,
    saveMaterialData:saveMaterialData
};
module.exports = dbService;
