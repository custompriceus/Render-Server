const { dbService } = require("../services");
const { constants } = require("../data");
const { utilities } = require("../utilities");
const { formatNumber } = require("../utilities/utilities");

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = async (req, res) => {
  const user = await dbService.getUserByIdOld(req.params.id);
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
    const user = await dbService.getUserByIdOld(req.body.userId);
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
        const user = await dbService.getUserByIdOld(req.body.userId);
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
    const user = await dbService.getUserByIdOld(req.body.userId);
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
    const user = await dbService.getUserByIdOld(req.body.userId);
    let userWithToken = user;
    userWithToken.accessToken = req.headers["x-access-token"];
    console.log(`league deck registered for user ${req.body.userId}`)

    res.status(200).send(userWithToken);
  }
};

exports.submitNewLightDarkPricing = async (req, res) => {
  if(req.body.password === process.env.EDITPASSWORD) {
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
  }
  else {
    res.status(200).send(`Wrong Password`);
  }
};

exports.submitNewEmbroideryPricing = async (req, res) => {
  if(req.body.password === process.env.EDITPASSWORD) {
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
  }
  else {
    res.status(200).send(`Wrong Password`);
  }
};

exports.getEmbroideryPriceQuote = async (req, res) => {
  const data = req.body
  console.log(' ');
  console.log(`at get embroidery price quote for user with email ${req.body.email}`)

  const embroideryPrices = await dbService.getEmbroideryPrices();
  if (!embroideryPrices) {
    res.status(400).send({ message: `Failed To Get Shirt Price Quote` });
  }

  const parsedData = utilities.parseShirtPriceQuoteData(data);
  const shirtCost = parsedData.shirtCost
  const shirtQuantity = parsedData.shirtQuantity;
  const markUp = parsedData.markUp;
  const shirtQuantityBucket = utilities.getEmbroideryShirtQuantityBucket(shirtQuantity);
  const locationsResult = utilities.getLocationsResultForEmbroidery(data.locations, shirtQuantityBucket, embroideryPrices);

  const netCost = (locationsResult.totalLocationsPrice + shirtCost);
  const profitLoss = utilities.getProfitLoss(netCost, markUp, shirtQuantity)
  const retailTotal = formatNumber(profitLoss.retailPrice * shirtQuantity);
  const totalProfit = formatNumber(profitLoss.profit * shirtQuantity);

  let result = [
    {
      text: "Quantity:",
      value: shirtQuantity,
      style: null
    },
  ]

  locationsResult.items.map((item, index) => {
    if (item.stitches && parseFloat(item.stitches) > 0) {
      result.push(
        {
          text: `${item.suffix} - Amt of stitches:`,
          value: item.stitches,
          style: { borderTop: '1px dotted' },
        },
      )
    }
    if (item.locationPrice && item.locationPrice > 0) {
      result.push(
        {
          text: `${item.suffix} - Cost:`,
          value: '$' + formatNumber(item.locationPrice),
          style: null,
        },
      )
    }
  }
  )

  result.push(
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
      value: '$' + formatNumber(retailTotal),
      style: { borderBottom: '1px dotted' },
    },
    {
      text: "Total Profit:",
      value: '$' + formatNumber(totalProfit),
      style: null
    },
  )

  res.status(200).send({ result: result })
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

exports.getShirtPriceQuote = async (req, res) => {
  const data = req.body
  console.log(' ');
  console.log(`at get shirt price quote for user with email ${req.body.email}`)
  console.log(req.body);
  const shirtPrices = await dbService.getShirtPrices();
  if (!shirtPrices) {
    res.status(400).send({ message: `Failed To Get Shirt Price Quote` });
  }

  const materialData = await dbService.getMaterialData();
  if (!materialData) {
    res.status(400).send({ message: `Failed To Get Shirt Price Quote` });
  }
  console.log(materialData);
  const parsedData = utilities.parseShirtPriceQuoteData(data);
  const shirtCost = parsedData.shirtCost
  const shirtQuantity = parsedData.shirtQuantity;
  const markUp = parsedData.markUp;
  const jerseyNumberSides = parsedData.jerseyNumberSides;

  const locationsResult = utilities.getLocationsResult(data.locations, shirtQuantity, shirtPrices, data.additionalItems,materialData);

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
  //const retailPricePerShirtWithScreenCharges = formatNumber(((profitLoss.retailPrice * shirtQuantity) + screenChargeTotal) / shirtQuantity)
  const retailPerScreencharge = screenChargeTotal+(screenChargeTotal*markUp/100);
  const retailPricePerShirtWithScreenCharges = formatNumber(retailPerScreencharge /shirtQuantity  + profitLoss.retailPrice)
  const profitperscreencharge = formatNumber(screenChargeTotal*markUp/100)
  //const retailCostTotalWithScreenCharges = formatNumber((profitLoss.retailPrice * shirtQuantity) + screenChargeTotal)
const retailCostTotalWithScreenCharges = formatNumber(retailPerScreencharge +(profitLoss.retailPrice * shirtQuantity))
const totalProfitwithscreencharges = formatNumber((screenChargeTotal*markUp/100) + (profitLoss.profit * shirtQuantity))
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
        text: "Jersey Number Sides:",
        value: jerseyNumberSides,
        style: null
      },
      {
        text: "Jersey Number Cost:",
        value: '$' + formatNumber(jerseyNumberCost),
        style: null
      },
    )
  }

  resultWithScreenCharges.push(
    {
      text: "Shirt Cost:",
      value: '$' + formatNumber(shirtCost),
      style: { borderBottom: '1px dotted' }
    },
    {
      text: "Net Cost:",
      value: '$' + formatNumber(netCost),
      style: null
    },
    {
      text: "Mark Up:",
      value: formatNumber(markUp) + "%",
      style: { borderBottom: '1px dotted' }
    },
    {
      text: "Profit Per Shirt:",
      value: '$' + formatNumber(profitLoss.profit),
      style: null
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
      style: { borderBottom: '1px dotted' },
    },
    {
      text: "Screen Charge Mark Up:",
      value: formatNumber(markUp) + "%",
      style: { borderBottom: '1px dotted' }
    },
    {
      text: "Profit Per Screen Charge:",
      value: '$'+ formatNumber(screenChargeTotal*markUp/100) ,
      style: { borderBottom: '1px dotted' }
    },
     {
      text: "Retail Per Screen Charge:",
      value: '$' + formatNumber(screenChargeTotal+(screenChargeTotal*markUp/100)),
      style: null
    },
    {
      text: "Net Total Cost With Screen Charges:",
      value: '$' + netCostWithScreenCharges,
      style: null
    },
   
    {
      text: "Retail Price Per Shirt With Screen Charges:",
      value: '$' + formatNumber(retailPricePerShirtWithScreenCharges),
      style: { borderBottom: '1px dotted' },
    },
    {
      text: "Retail Total Cost With Screen Charges:",
      value: '$' + retailCostTotalWithScreenCharges,
      style: null
    },
    {
      text: "Total Profit With Screen Charges:",
      value: '$' + totalProfitwithscreencharges,
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
        text: "Jersey Number Sides:",
        value: jerseyNumberSides,
        style: null
      },
      {
        text: "Jersey Number Cost:",
        value: '$' + formatNumber(jerseyNumberCost),
        style: null
      },
    )
  }


  resultWithOutScreenCharges.push(
    {
      text: "Shirt Cost:",
      value: '$' + formatNumber(shirtCost),
      style: { borderBottom: '1px dotted' }
    },
    {
      text: "Net Cost:",
      value: '$' + formatNumber(netCost),
      style: null
    },
    {
      text: "Mark Up:",
      value: formatNumber(markUp) + "%",
      style: { borderBottom: '1px dotted' }
    },
    {
      text: "Profit Per Shirt:",
      value: '$' + formatNumber(profitLoss.profit),
      // style: { borderBottom: '1px dotted' }
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

exports.saveScreenCharge = async (req, res) => {
  

  // Optional: password protection
  // if (req.body.password !== process.env.EDITPASSWORD) {
  //   return res.status(200).send('Wrong Password');
  // }

  const { screenCharge } = req.body;
  if (screenCharge === undefined) {
    return res.status(400).json({ success: false, error: 'No screenCharge provided' });
  }
  try {
    await dbService.saveScreenCharge(screenCharge);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
};

exports.getScreenCharge = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
    try {
        const result = await dbService.getScreenCharge();
        if (result) {
            res.status(200).json({ screenCharge: result.value });
        } else {
            res.status(404).json({ screenCharge: 'test' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};
exports.saveMaterialData = async (req, res) => {
  // Optional: password protection
  // if (req.body.password !== process.env.EDITPASSWORD) {
  //   return res.status(200).send('Wrong Password');
  // }

  const { field1,field2,field3,field4 } = req.body;
  if (field1 === undefined) {
    return res.status(400).json({ success: false, error: 'No MaterialData provided' });
  }
  try {

    await dbService.saveMaterialData(field1,field2,field3,field4);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
};
exports.getMaterialData = async (req, res) => {
    try {
        const result = await dbService.getMaterialData();
        if (result) {
            res.status(200).json({ alldata: result });
        } else {
            res.status(404).json({ alldata: 'test' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};