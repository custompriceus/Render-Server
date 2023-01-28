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
  console.log(`at create league for user ${req.body.userId}`)
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
  console.log(`at join league for user ${req.body.userId}`)
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
        console.log(`Joined league with id ${req.body.leagueId} for user ${req.body.userId}`);

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
  console.log(`at create deck for user ${req.body.userId}`)
  const submittedDeck = await dbService.submitDeck(req.body.userId, req.body.deckName, req.body.deckUrl, req.body.deckPrice);
  if (!submittedDeck) {
    console.log(`failed to create deck for user ${req.body.userId}`)
    res.status(400).send({ message: `Failed To Submit Deck` });
  }
  else {
    const user = await dbService.getUserById(req.body.userId);
    let userWithToken = user;
    userWithToken.accessToken = req.headers["x-access-token"];
    console.log(`created deck for user ${req.body.userId}`)

    res.status(200).send(userWithToken);
  }
};

exports.registerLeagueDeck = async (req, res) => {
  console.log(' ');
  console.log(`at register league deck for user ${req.body.userId}`)
  const registeredLeagueDeck = await dbService.registerLeagueDeck(req.body.userId, req.body.deckDetails);
  if (!registeredLeagueDeck) {
    console.log(`failed to register league deck for user ${req.body.userId}`)
    res.status(400).send({
      message: `Failed To Register League Deck`
    });
  }
  else {
    const user = await dbService.getUserById(req.body.userId);
    let userWithToken = user;
    userWithToken.accessToken = req.headers["x-access-token"];
    console.log(`league deck registered for user ${req.body.userId}`)

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

exports.getShirtPriceQuote = async (req, res) => {
  const data = req.body
  console.log(' ');
  console.log(`at get shirt price quote for user with email ${req.body.email}`)
  console.log(req.body);
  const shirtPrices = await dbService.getShirtPrices();
  if (!shirtPrices) {
    res.status(400).send({ message: `Failed To Get Shirt Price Quote` });
  }

  const parsedData = utilities.parseShirtPriceQuoteData(data);
  const shirtCost = parsedData.shirtCost
  const shirtQuantity = parsedData.shirtQuantity;
  const markUp = parsedData.markUp;
  const jerseyNumberSides = parsedData.jerseyNumberSides;
  const locationsResult = utilities.getLocationsResult(data.locations, shirtQuantity, shirtPrices, data.additionalItems);

  const totalPrintColors = locationsResult.totalColors;
  const costPerScreen = parseFloat(parsedData.costPerScreen);
  const displayScreenCharge = parsedData.screenCharge;
  const screenChargeTotal = displayScreenCharge ? parsedData.costPerScreen * totalPrintColors : null;
  const jerseyNumberCost = jerseyNumberSides && jerseyNumberSides > 0 ? jerseyNumberSides * 2 : 0

  const netCost = (locationsResult.totalLocationsPrice + shirtCost + jerseyNumberCost);
  const profitLoss = utilities.getProfitLoss(netCost, markUp, shirtQuantity)
  const retailTotalCostWithoutScreenCharges = formatNumber(profitLoss.retailPrice * shirtQuantity);
  const netCostWithScreenCharges = formatNumber(profitLoss.totalCost + screenChargeTotal);
  const totalProfitWithoutScreenCharges = formatNumber(profitLoss.profit * shirtQuantity);
  const retailPricePerShirtWithScreenCharges = formatNumber(((profitLoss.retailPrice * shirtQuantity) + screenChargeTotal) / shirtQuantity)
  const retailCostTotalWithScreenCharges = formatNumber((profitLoss.retailPrice * shirtQuantity) + screenChargeTotal)

  let resultWithScreenCharges = [
    {
      text: "Quantity:",
      value: shirtQuantity,
      style: null
    },
  ]

  locationsResult.items.map((item, index) => {
    if (item.colors && parseFloat(item.colors) > 0) {
      resultWithScreenCharges.push(
        {
          text: `${item.suffix} - Amt of colors:`,
          value: item.colors,
          style: { borderTop: '1px dotted' },
        },
      )
    }
    if (item.locationPrice && item.locationPrice > 0) {
      resultWithScreenCharges.push(
        {
          text: `${item.suffix} - Cost:`,
          value: '$' + formatNumber(item.locationPrice + item.additionalItemsPrice),
          style: null,
          additionalItems: item.additionalItemsName,
          costDescription: `print cost $${formatNumber(item.locationPrice)}, additional items cost $${formatNumber(item.additionalItemsPrice)}`
        },
      )
    }
  }
  )

  if (jerseyNumberSides && jerseyNumberSides > 0) {
    resultWithScreenCharges.push(
      {
        text: "Optional - Jersey Number Sides:",
        value: jerseyNumberSides,
        style: null
      },
      {
        text: "Optional - Jersey Number Cost:",
        value: '$' + formatNumber(jerseyNumberCost),
        style: null
      },
    )
  }

  resultWithScreenCharges.push(
    {
      text: "Shirt Cost:",
      value: '$' + formatNumber(shirtCost),
      style: null
    },
    {
      text: "Net Cost:",
      value: '$' + formatNumber(netCost),
      style: null
    },
    {
      text: "Mark Up:",
      value: formatNumber(markUp) + "%",
      style: null
    },
    {
      text: "Profit Per Shirt:",
      value: '$' + formatNumber(profitLoss.profit),
      style: { borderBottom: '1px dotted' }
    },
    {
      text: "Retail Price Per Shirt:",
      value: '$' + formatNumber(profitLoss.retailPrice),
      style: { borderBottom: '1px dotted' },
    },
    {
      text: "Net Total Cost Without Screen Charges:",
      value: '$' + formatNumber(profitLoss.totalCost),
      style: null
    },
    {
      text: "Retail Total Cost Without Screen Charges:",
      value: '$' + retailTotalCostWithoutScreenCharges,
      style: { borderBottom: '1px dotted' },
    },
    {
      text: "Total Profit Without Screen Charges:",
      value: '$' + totalProfitWithoutScreenCharges,
      style: null
    },
    {
      text: `Screen Charges: Total Cost (${locationsResult.totalColors} colors x $${formatNumber(costPerScreen)})`,
      value: '$' + formatNumber(screenChargeTotal),
      style: null
    },
    {
      text: "Net Total Cost With Screen Charges:",
      value: '$' + netCostWithScreenCharges,
      style: { borderBottom: '1px dotted' },
    },
    {
      text: "Retail Price Per Shirt With Screen Charges:",
      value: '$' + formatNumber(retailPricePerShirtWithScreenCharges),
      style: { borderBottom: '1px dotted' },
    },
    {
      text: "Retail Total Cost With Screen Charges:",
      value: '$' + formatNumber(retailCostTotalWithScreenCharges),
      style: null
    },
    {
      text: "Total Profit With Screen Charges:",
      value: '$' + totalProfitWithoutScreenCharges,
      style: null
    }
  )

  let resultWithOutScreenCharges = [
    {
      text: "Quantity:",
      value: shirtQuantity,
      style: null
    },
  ]

  locationsResult.items.map((item, index) => {
    if (item.colors && parseFloat(item.colors) > 0) {
      resultWithOutScreenCharges.push(
        {
          text: `${item.suffix} - Amt of colors:`,
          value: item.colors,
          style: { borderTop: '1px dotted' },
        },
      )
    }
    if (item.locationPrice && item.locationPrice > 0) {
      resultWithOutScreenCharges.push(
        {
          text: `${item.suffix} - Cost:`,
          value: '$' + formatNumber(item.locationPrice + item.additionalItemsPrice),
          style: null,
          additionalItems: item.additionalItemsName,
          costDescription: `print cost $${formatNumber(item.locationPrice)}, additional items cost $${formatNumber(item.additionalItemsPrice)}`
        },
      )
    }
  }
  )

  if (jerseyNumberSides && jerseyNumberSides > 0) {
    resultWithOutScreenCharges.push(
      {
        text: "Optional - Jersey Number Sides:",
        value: jerseyNumberSides,
        style: null
      },
      {
        text: "Optional - Jersey Number Cost:",
        value: '$' + formatNumber(jerseyNumberCost),
        style: null
      },
    )
  }


  resultWithOutScreenCharges.push(
    {
      text: "Shirt Cost:",
      value: '$' + formatNumber(shirtCost),
      style: null
    },
    {
      text: "Net Cost:",
      value: '$' + formatNumber(netCost),
      style: null
    },
    {
      text: "Mark Up:",
      value: formatNumber(markUp) + "%",
      style: null
    },
    {
      text: "Profit Per Shirt:",
      value: '$' + formatNumber(profitLoss.profit),
      style: { borderBottom: '1px dotted' }
    },
    {
      text: "Retail Price Per Shirt:",
      value: '$' + formatNumber(profitLoss.retailPrice),
      style: { borderBottom: '1px dotted' },
    },
    {
      text: "Net Total Cost:",
      value: '$' + formatNumber(profitLoss.totalCost),
      style: null
    },
    {
      text: "Retail Total Cost:",
      value: '$' + retailTotalCostWithoutScreenCharges,
      style: { borderBottom: '1px dotted' },
    },
    {
      text: "Total Profit:",
      value: '$' + totalProfitWithoutScreenCharges,
      style: null
    },
  )

  res.status(200).send({ screenCharge: displayScreenCharge, resultWithScreenCharges: displayScreenCharge ? resultWithScreenCharges : null, resultWithOutScreenCharges: resultWithOutScreenCharges })
}

exports.getShirtPricingDisplay = async (req, res) => {
  const shirtPricingDisplay = constants.shirtPricingDisplay;
  if (shirtPricingDisplay) {
    res.status(200).send(shirtPricingDisplay);
  }
  else {
    res.status(400).send({ message: `Failed To Get Shirt Pricing Display` });
  }
};

exports.getShirtPrices = async (req, res) => {
  const shirtPrices = await dbService.getShirtPrices();
  if (!shirtPrices) {
    res.status(400).send({ message: `Failed To Get Shirt Prices` });
  }
  else {
    res.status(200).send(shirtPrices);
  }
};

exports.getEmbroideryPricingDisplay = async (req, res) => {
  const embroideryPricingDisplay = constants.embroideryPricingDisplay;
  if (embroideryPricingDisplay) {
    res.status(200).send(embroideryPricingDisplay);
  }
  else {
    res.status(400).send({ message: `Failed To Get Embroidery Pricing Display` });
  }
};

exports.getEmbroideryPriceQuote = async (req, res) => {
  console.log(' ');
  console.log(`at get embroidery price quote for user with email ${req.body.email}`);
  // console.log(req.body);
  const data = req.body.inputs

  const embroideryPrices = await dbService.getEmbroideryPrices();
  if (!embroideryPrices) {
    res.status(400).send({ message: `Failed To Get Embroidery Price Quote` });
  }
  else {
    const parsedData = utilities.parseEmbroideryPriceQuoteData(data);
    const shirtCost = parsedData.shirtCost
    const shirtQuantity = parsedData.shirtQuantity;
    const markUp = parsedData.markUp;
    const location1Stitches = parsedData.location1Stitches;
    const location2Stitches = parsedData.location2Stitches;
    const location3Stitches = parsedData.location3Stitches;
    const location4Stitches = parsedData.location4Stitches;

    const embroideryShirtQuantityBucket = utilities.getEmbroideryShirtQuantityBucket(shirtQuantity);

    const location1StitchBucket = location1Stitches ? getStitchQuantityBucket(parseInt(location1Stitches)) : null
    const location1PrintCost = location1Stitches && location1Stitches > 0 ? getEmbroideryPrintCost(embroideryShirtQuantityBucket, location1StitchBucket, embroideryPrices) : 0;

    const location2StitchBucket = location2Stitches ? getStitchQuantityBucket(parseInt(location2Stitches)) : null
    const location2PrintCost = location2Stitches && location2Stitches > 0 ? getEmbroideryPrintCost(embroideryShirtQuantityBucket, location2StitchBucket, embroideryPrices) : 0;

    const location3StitchBucket = location3Stitches ? getStitchQuantityBucket(parseInt(location3Stitches)) : null
    const location3PrintCost = location3Stitches && location3Stitches > 0 ? getEmbroideryPrintCost(embroideryShirtQuantityBucket, location3StitchBucket, embroideryPrices) : 0;

    const location4StitchBucket = location4Stitches ? getStitchQuantityBucket(parseInt(location4Stitches)) : null
    const location4PrintCost = location4Stitches && location4Stitches > 0 ? getEmbroideryPrintCost(embroideryShirtQuantityBucket, location4StitchBucket, embroideryPrices) : 0;

    const netCost = (location1PrintCost + location2PrintCost + location3PrintCost + location4PrintCost + shirtCost);
    const profitLoss = utilities.getProfitLoss(netCost, markUp, shirtQuantity)

    res.status(200).send(
      [
        {
          text: "Quantity",
          value: shirtQuantity,
          style: null
        },
        {
          text: "Location 1 Stitches",
          value: location1Stitches,
          style: null
        },
        {
          text: "Location 2 Stitches",
          value: location2Stitches,
          style: null
        },
        {
          text: "Location 3 Stitches",
          value: location3Stitches,
          style: null
        },
        {
          text: "Location 4 Stitches",
          value: location4Stitches,
          style: null
        },
        {
          text: "Location 1 Cost",
          value: '$' + utilities.formatNumber(location1PrintCost),
          style: null
        },
        {
          text: "Location 2 Cost",
          value: '$' + utilities.formatNumber(location2PrintCost),
          style: null
        },
        {
          text: "Location 3 Cost",
          value: '$' + utilities.formatNumber(location3PrintCost),
          style: null
        },
        {
          text: "Location 4 Cost",
          value: '$' + utilities.formatNumber(location4PrintCost),
          style: null
        },
        {
          text: "Shirt Cost",
          value: '$' + formatNumber(shirtCost),
          style: null
        },
        {
          text: "Net Cost",
          value: '$' + formatNumber(netCost),
          style: null
        },
        {
          text: "Mark Up",
          value: formatNumber(markUp) + "%",
          style: null
        },
        {
          text: "Profit",
          value: '$' + formatNumber(profitLoss.profit),
          style: { borderBottom: '1px dotted' },
        },
        {
          text: "Retail Price",
          value: '$' + formatNumber(profitLoss.retailPrice),
          style: { borderBottom: '1px dotted' },
        },
        {
          text: "Total Cost",
          value: '$' + formatNumber(profitLoss.totalCost).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
          style: null
        },
        {
          text: "Total Profit",
          value: '$' + formatNumber(profitLoss.totalProfit).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
          style: null
        },
      ]
    )
  }
};

exports.getEmbroideryPrices = async (req, res) => {
  const embroideryPrices = await dbService.getEmbroideryPrices();
  if (!embroideryPrices) {
    res.status(400).send({ message: `Failed To Get Embroidery Prices` });
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
    res.status(400).send({ message: `Failed To Get Pricing List` });
  }
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};
