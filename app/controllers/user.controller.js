const { dbService } = require("../services");
const { constants } = require("../data");
const { utilities } = require("../utilities");

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = async (req, res) => {
  const user = await dbService.getUserById(req.params.id);
  if (!user) {
    res.status(400).send({
      message: `Failed to find user with id ${req.params.id}`
    });
  }
  else {
    let userWithToken = user;
    userWithToken.accessToken = req.headers["x-access-token"];

    res.status(200).send(user);
  }
};

exports.createLeague = async (req, res) => {
  console.log(' ');
  console.log('at create league for user ', req.body.userId)
  const league = await dbService.createLeague(req.body.userId, req.body.leagueName);
  if (!league) {
    console.log(`failed to create a league for user ${req.body.userId}`);
    res.status(400).send({
      message: `Failed to create a league`
    });
  }
  else {
    const user = await dbService.getUserById(req.body.userId);
    if (!user) {
      console.log(`failed to find user with id ${req.body.userId}`);
      res.status(400).send({
        message: `Failed to find user with id ${req.body.userId}`
      });
    }
    else {
      let userWithToken = user;

      userWithToken.accessToken = req.headers["x-access-token"];
      console.log(`created a league for user ${req.body.userId}`);
      res.status(200).send(userWithToken);
    }
  }
};

exports.joinLeague = async (req, res) => {
  console.log(' ');
  console.log('at join league for user ', req.body.userId)
  const leagueExists = await dbService.getLeagueById(req.body.leagueId)
  if (!leagueExists) {
    console.log(`Failed To Find League With Id ${req.body.leagueId} for user ${req.body.userId}`);
    res.status(400).send({
      message: `Failed To Find League With Id ${req.body.leagueId}`
    });
  }
  else {
    if (leagueExists.id) {
      const league = await dbService.joinLeague(req.body.userId, req.body.leagueId);
      if (!league) {
        console.log(`Failed To join League With Id ${req.body.leagueId} for user ${req.body.userId}`);
        res.status(400).send({
          message: `Failed To Join League With Id ${req.body.leagueId}`
        });
      }
      else {
        const user = await dbService.getUserById(req.body.userId);
        let userWithToken = user;
        userWithToken.accessToken = req.headers["x-access-token"];
        console.log(`joined league with id ${req.body.leagueId} for user ${req.body.userId}`);

        res.status(200).send(userWithToken);
      }
    }
    else {
      console.log(`Failed To Find League With Id ${req.body.leagueId} for user ${req.body.userId}`);
      res.status(400).send({
        message: `Failed To Find League With Id ${req.body.leagueId}`
      });
    }
  }
};

exports.submitDeck = async (req, res) => {
  console.log(' ');
  console.log('at create deck for user ', req.body.userId)
  const submittedDeck = await dbService.submitDeck(req.body.userId, req.body.deckName, req.body.deckUrl, req.body.deckPrice);
  if (!submittedDeck) {
    console.log('failed to create deck for user ', req.body.userId)
    res.status(400).send({
      message: `Failed To Submit Deck`
    });
  }
  else {
    const user = await dbService.getUserById(req.body.userId);
    let userWithToken = user;
    userWithToken.accessToken = req.headers["x-access-token"];
    console.log('created deck for user ', req.body.userId)

    res.status(200).send(userWithToken);
  }
};

exports.registerLeagueDeck = async (req, res) => {
  console.log(' ');
  console.log('at register league deck for user ', req.body.userId)
  const registeredLeagueDeck = await dbService.registerLeagueDeck(req.body.userId, req.body.deckDetails);
  if (!registeredLeagueDeck) {
    console.log('failed to register league deck for user ', req.body.userId)
    res.status(400).send({
      message: `Failed To Register League Deck`
    });
  }
  else {
    const user = await dbService.getUserById(req.body.userId);
    let userWithToken = user;
    userWithToken.accessToken = req.headers["x-access-token"];
    console.log('league deck registered for user ', req.body.userId)

    res.status(200).send(userWithToken);
  }
};

exports.submitNewLightDarkPricing = async (req, res) => {
  console.log(' ');
  console.log('at update light dark prices')
  if (req.body && req.body.newPrices && req.body.newPrices.map && req.body.newPrices.length > 0) {
    const response = await Promise.all(req.body.newPrices.map(async (newPrice) => {
      await dbService.updateShirtPrice(newPrice.colors, newPrice.quantity, newPrice.price)
    }))
    if (response) {
      console.log('light dark prices updated')
      res.status(200).send('Light Dark Prices Updated');
    }
    else {
      console.log('failed to update light dark prices')
      res.status(400).send(`Failed To Update Light Dark Prices`);
    }
  }
};

exports.submitNewEmbroideryPricing = async (req, res) => {
  console.log(' ');
  console.log('at update embroidery prices')
  if (req.body && req.body.newPrices && req.body.newPrices.map && req.body.newPrices.length > 0) {
    const response = await Promise.all(req.body.newPrices.map(async (newPrice) => {
      await dbService.updateEmbroideryPrice(newPrice.stitches, newPrice.quantity, newPrice.price)
    }))
    if (response) {
      console.log('embroidery prices updated')
      res.status(200).send('Embroidery Prices Updated');
    }
    else {
      console.log('failed to update embroidery prices')
      res.status(400).send(`Failed To Update Embroidery Prices`);
    }
  }
};

exports.getPriceQuote = async (req, res) => {
  console.log(' ');
  console.log('at get price quote');
  console.log(req.body);
  const data = req.body.inputs

  const shirtPrices = await dbService.getShirtPrices();
  if (!shirtPrices) {
    res.status(400).send({
      message: `Failed To Get Price Quote`
    });
  }
  else {
    const parsedData = utilities.parseData(data);

    const shirtCost = parsedData.shirtCost
    const shirtQuantity = parsedData.shirtQuantity;
    const markUp = parsedData.markUp;
    const printSideOneColors = parsedData.printSideOneColors;
    const printSideTwoColors = parsedData.printSideTwoColors;
    const jerseyNumberSides = parsedData.jerseyNumberSides;

    const shirtQuantityBucket = utilities.getShirtQuantityBucket(shirtQuantity);
    const printSideOneCost = printSideOneColors ? utilities.getPrintCost(shirtQuantityBucket, printSideOneColors, shirtPrices) : 0;
    const printSideTwoCost = printSideTwoColors ? utilities.getPrintCost(shirtQuantityBucket, printSideTwoColors, shirtPrices) : 0;
    const jerseyNumberCost = jerseyNumberSides ? jerseyNumberSides * 2 : 0

    let finalSelectedItems = [];
    let finalSelectedItemsString = '';
    let additionalItemsCost = 0.00;

    if (req.body.selectedAdditionalItems && req.body.selectedAdditionalItems.map) {
      const additionalItemsInfo = utilities.getAdditionalItemsInfo(req.body.selectedAdditionalItems, shirtQuantity)
      finalSelectedItems = additionalItemsInfo.finalSelectedItems
      finalSelectedItemsString = additionalItemsInfo.finalSelectedItemsString,
        additionalItemsCost = additionalItemsInfo.additionalItemsCost
    }

    const netCost = (printSideOneCost + printSideTwoCost + shirtCost + jerseyNumberCost + additionalItemsCost);
    const profitLoss = utilities.getProfitLoss(netCost, markUp, shirtQuantity)

    res.status(200).send(
      {
        shirtCost: shirtCost,
        shirtQuantity: shirtQuantity,
        markUp: markUp,
        printSideOneColors: printSideOneColors,
        printSideTwoColors: printSideTwoColors,
        jerseyNumberSides: jerseyNumberSides,
        shirtQuantityBucket: shirtQuantityBucket,
        printSideOneCost: printSideOneCost,
        printSideTwoCost: printSideTwoCost,
        jerseyNumberCost: jerseyNumberCost,
        additionalItemsCost: additionalItemsCost,
        netCost: netCost,
        profit: profitLoss.profit,
        retailPrice: profitLoss.retailPrice,
        totalCost: profitLoss.totalCost,
        totalProfit: profitLoss.totalProfit,
        finalSelectedItems: finalSelectedItems,
        finalSelectedItemsString: finalSelectedItemsString,
        selectedAdditionalItems: constants.additionalItems,
        additionalItemsCost: additionalItemsCost
      }
    )
  }
};

exports.getShirtPrices = async (req, res) => {
  const shirtPrices = await dbService.getShirtPrices();
  if (!shirtPrices) {
    res.status(400).send({
      message: `Failed To Get Shirt Prices`
    });
  }
  else {
    res.status(200).send(shirtPrices);
  }
};

exports.getEmbroideryPrices = async (req, res) => {
  const embroideryPrices = await dbService.getEmbroideryPrices();
  if (!embroideryPrices) {
    res.status(400).send({
      message: `Failed To Get Embroidery Prices`
    });
  }
  else {
    res.status(200).send(embroideryPrices);
  }
};

exports.getPricingList = async (req, res) => {
  const shirtPrices = await dbService.getShirtPrices();
  const embroideryPrices = await dbService.getEmbroideryPrices();

  if (shirtPrices && embroideryPrices) {
    const shirtPricingBuckets = constants.shirtQuantityBuckets.map(shirtQuantityBucket => {
      return {
        shirtQuantityBucket: shirtQuantityBucket,
        prices: constants.shirtColorQuantities.map(colorQuantity => {
          return shirtPrices.find(element => element.colors === colorQuantity && element.quantity === shirtQuantityBucket)
        }).sort((a, b) => {
          if (a.colors > b.colors) return 1;
          if (a.colors < b.colors) return -1;
          return 0;
        })
      }
    })

    const embroideryPricingBuckets = constants.embroideryQuantityBuckets.map(embroideryQuantityBucket => {
      return {
        embroideryQuantityBucket: embroideryQuantityBucket,
        prices: constants.embroideryStitchBuckets.map(stitchBucket => {
          return embroideryPrices.find(element => element.stitches === stitchBucket && element.quantity === embroideryQuantityBucket);
        })
          .sort((a, b) => {
            const stitchQuantityBucketA = parseInt(a.stitches.substring(a.stitches.indexOf("-") + 1, 100))
            const stitchQuantityBucketB = parseInt(b.stitches.substring(b.stitches.indexOf("-") + 1, 100))

            if (stitchQuantityBucketA > stitchQuantityBucketB) return 1;
            if (stitchQuantityBucketA < stitchQuantityBucketB) return -1;
            return 0;
          })
      }
    })

    res.status(200).send({
      shirtPrices: shirtPrices,
      embroideryPrices: embroideryPrices,
      shirtColorQuantities: constants.shirtColorQuantities,
      embroideryQuantityBuckets: constants.embroideryQuantityBuckets,
      embroideryStitchBuckets: constants.embroideryStitchBucketsForDisplay,
      shirtPricingBuckets: shirtPricingBuckets,
      embroideryPricingBuckets: embroideryPricingBuckets
    });
  }
  else {
    res.status(400).send({
      message: `Failed To Get Pricing List`
    });
  }
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};
