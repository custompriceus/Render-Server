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
   // console.log(embroideryPrices);
    if (!embroideryPrices) {
      res.status(400).send({ message: `Failed To Get Shirt Price Quote` });
    }
 // ✅ force default stitches range if blank
    console.log('before '+ data.locations);
  if (Array.isArray(data.locations)) {
    data.locations = data.locations.map(loc => {
      // only for stitch-type locations
      if (
        loc.text?.toLowerCase().includes('stitch') && // only embroidery
        (!loc.value || loc.value.trim() === '')
      ) {
        return { ...loc, value: '1-5' }; // default range
      }
      return loc;
    });
  }
  console.log('after '+ data.locations);
    const parsedData = utilities.parseShirtPriceQuoteData(data);
    const shirtCost = parsedData.shirtCost
    const shirtQuantity = parsedData.shirtQuantity;
    const markUp = parsedData.markUp;
    const shirtQuantityBucket = utilities.getEmbroideryShirtQuantityBucket(shirtQuantity);
  //  console.log(shirtQuantityBucket);
    const locationsResult = utilities.getLocationsResultForEmbroidery(data.locations, shirtQuantityBucket, embroideryPrices);
  //console.log(locationsResult);
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
exports.getEmbroideryPriceCompareQuote = async (req, res) => {
  try {
    const data = req.body;
    console.log(`\nAt getEmbroideryPriceCompareQuote for user with email ${req.body.email}`);
    console.log(req.body);

    // Fetch embroidery pricing table
    const embroideryPrices = await dbService.getEmbroideryPrices();
    if (!embroideryPrices) {
      return res.status(400).send({ message: `Failed To Get Embroidery Price Compare Quote` });
    }
   
    // Parse common input
    const parsedData = utilities.parseShirtPriceQuoteData(data);
    const shirtCost = parsedData.shirtCost;
    const markUp = parsedData.markUp;

    // Helper: build quote for a given quantity
    const buildQuoteForQty = (qty) => {
      const qtyBucket = utilities.getEmbroideryShirtQuantityBucket(qty);
      const locationsResult = utilities.getLocationsResultForEmbroidery(
        data.locations,
        qtyBucket,
        embroideryPrices
      );

      const netCostPerShirt = (locationsResult.totalLocationsPrice || 0) + (shirtCost || 0);

      // Profit/Loss per shirt
      const profitLoss = utilities.getProfitLoss(netCostPerShirt, markUp, qty);

      // Totals
      const retailTotal = profitLoss.retailPrice * qty;
      const totalProfit = profitLoss.profit * qty;

      let result = [
        { text: "Quantity:", value: qty, style: null }
      ];

      locationsResult.items.forEach((item) => {
        if (item.stitches && parseFloat(item.stitches) > 0) {
          result.push({
            text: `${item.suffix} - Amt of stitches:`,
            value: item.stitches,
            style: { borderTop: '1px dotted' }
          });
        }
        if (item.locationPrice && item.locationPrice > 0) {
          result.push({
            text: `${item.suffix} - Cost:`,
            value: '$' + formatNumber(item.locationPrice),
            style: null
          });
        }
      });

      result.push(
        { text: "Shirt Cost:", value: '$' + formatNumber(shirtCost), style: null },
        { text: "Net Cost:", value: '$' + formatNumber(netCostPerShirt), style: null },
        { text: "Mark Up:", value: formatNumber(markUp) + "%", style: null },
        { text: "Profit Per Shirt:", value: '$' + formatNumber(profitLoss.profit), style: { borderBottom: '1px dotted' } },
        { text: "Retail Price Per Shirt:", value: '$' + formatNumber(profitLoss.retailPrice), style: { borderBottom: '1px dotted' } },
        { text: "Net Total Cost:", value: '$' + formatNumber(profitLoss.totalCost), style: null },
        { text: "Retail Total Cost:", value: '$' + formatNumber(retailTotal), style: { borderBottom: '1px dotted' } },
        { text: "Total Profit:", value: '$' + formatNumber(totalProfit), style: null }
      );

      return {
        quantity: qty,
        result,
        retailTotal: parseFloat(retailTotal.toFixed(2)),
        retailPricePerShirt: parseFloat(profitLoss.retailPrice.toFixed(2))
      };
    };

    // Build both comparison quotes
    const qty1 = parseInt(data.quantity1, 10);
    const qty2 = parseInt(data.quantity2, 10);
    const qty1Result = buildQuoteForQty(qty1);
    const qty2Result = buildQuoteForQty(qty2);

    // Comparison calculation
    const extraShirts = qty2 - qty1;
    const diffRetailTotal = qty2Result.retailTotal - qty1Result.retailTotal;
    const additionalPerShirtCost = extraShirts > 0 ? diffRetailTotal / extraShirts : 0;

    const responsePayload = {
      nextTierData: {
        nextTierCost: parseFloat(diffRetailTotal.toFixed(2)),
        quantity1: qty1,
        quantity2: qty2,
        quantity1TotalCost: formatNumber(qty1Result.retailTotal),
        quantity2TotalCost: formatNumber(qty2Result.retailTotal),
        extraShirts,
        additionalPerShirtCost: Math.floor(additionalPerShirtCost * 100) / 100
      }
    };

    return res.status(200).json({
      quantity1Result: qty1Result.result,
      quantity2Result: qty2Result.result,
      responsePayload
    });
  } catch (error) {
    console.error("Error calculating embroidery price comparison:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

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

   // 🔹 Normalise additional items from payload
  const normalizedAdditionalItems = [];
  if (Array.isArray(data.additionalItems)) {
    data.additionalItems.forEach(item => {
      if (item.item) {
        normalizedAdditionalItems.push(item.item);
      } else {
        Object.keys(item).forEach(key => {
          if (typeof item[key] === 'boolean' && item[key] === true) {
            normalizedAdditionalItems.push(key);
          }
        });
      }
    });
  } 
  console.log(normalizedAdditionalItems);
  const parsedData = utilities.parseShirtPriceQuoteData(data);
  const shirtCost = parsedData.shirtCost ? parseFloat(parsedData.shirtCost) : 0;
  const shirtQuantity = parsedData.shirtQuantity;
  const markUp = parsedData.markUp;
  const jerseyNumberSides = parsedData.jerseyNumberSides;

  const locationsResult = utilities.getLocationsResult(data.locations, shirtQuantity, shirtPrices, normalizedAdditionalItems,materialData);

  const totalPrintColors = locationsResult.totalColors;
  const costPerScreen = parseFloat(parsedData.costPerScreen);
  const displayScreenCharge = parsedData.screenCharge;
  const screenChargeTotal = displayScreenCharge ? parsedData.costPerScreen * totalPrintColors : null;
  const jerseyNumberCost = jerseyNumberSides && jerseyNumberSides > 0 ? jerseyNumberSides * 2 : 0

   const netCost =
    locationsResult.totalLocationsPrice + (shirtCost || 0) + jerseyNumberCost;
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
exports.getShirtPriceCompareQuote = async (req, res) => {
  try {
    const data = req.body;
    console.log(`\nAt getShirtPriceCompareQuote for user with email ${req.body.email}`);
    console.log(req.body);

    // fetch pricing tables (same as your single-quote)
    const shirtPrices = await dbService.getShirtPrices();
    if (!shirtPrices) {
      return res.status(400).send({ message: `Failed To Get Shirt Price Compare Quote` });
    }

    const materialData = await dbService.getMaterialData();
    if (!materialData) {
      return res.status(400).send({ message: `Failed To Get Shirt Price Compare Quote` });
    }

    // parsedData same as original
    const parsedData = utilities.parseShirtPriceQuoteData(data);
    const shirtCost = parsedData.shirtCost;
    const markUp = parsedData.markUp;
    const jerseyNumberSides = parsedData.jerseyNumberSides;
    const costPerScreen = parseFloat(parsedData.costPerScreen);
    const displayScreenCharge = parsedData.screenCharge;

    // Helper: build full detail arrays for a given quantity
    const buildQuoteForQty = (qty) => {
      // get per-shirt locations result using your existing utility
      const locationsResult = utilities.getLocationsResult(
        data.locations,
        qty,
        shirtPrices,
        data.additionalItems,
        materialData
      );

      const totalPrintColors = locationsResult.totalColors || 0;
      const screenChargeTotal = displayScreenCharge ? costPerScreen * totalPrintColors : 0; // total screen cost (order-level)
      const jerseyNumberCost = (jerseyNumberSides && jerseyNumberSides > 0) ? jerseyNumberSides * 2 : 0;

      // netCostPerShirt = per-shirt raw/net cost (locations + shirt + jersey number)
      const netCostPerShirt = (locationsResult.totalLocationsPrice || 0) + (shirtCost || 0) + (jerseyNumberCost || 0);

      // profitLoss uses same utility you already have (returns per-shirt retail & per-shirt profit and totalCost etc.)
      const profitLoss = utilities.getProfitLoss(netCostPerShirt, markUp, qty);
      // profitLoss.retailPrice => retail price per shirt (WITHOUT screen charges)
      // profitLoss.totalCost => net TOTAL cost for qty (WITHOUT screen charges)

      // Retail totals WITHOUT screen charges:
      const retailTotalWithoutScreen = profitLoss.retailPrice * qty;

      // Retailize the screen charge (apply markup to the screen charge, then add to retail totals)
      // same as your original: retailPerScreencharge = screenChargeTotal + (screenChargeTotal * markUp/100)
      const retailPerScreencharge = screenChargeTotal + (screenChargeTotal * markUp / 100);

      // Retail total WITH screen charges:
      const retailTotalWithScreen = retailTotalWithoutScreen + retailPerScreencharge;

      // Retail price per shirt WITH screen charges:
      const retailPricePerShirtWithScreen = profitLoss.retailPrice + (retailPerScreencharge / (qty || 1));

      // Prepare resultWithOutScreenCharges (same structure as your single-quote)
      const resultWithOutScreenCharges = [
        { text: "Quantity:", value: qty, style: null }
      ];

      locationsResult.items.forEach((item) => {
        if (item.colors && parseFloat(item.colors) > 0) {
          resultWithOutScreenCharges.push({
            text: `${item.suffix} - Amt of colors:`,
            value: item.colors,
            style: { borderTop: '1px dotted' }
          });
        }
        if (item.locationPrice && item.locationPrice > 0) {
          resultWithOutScreenCharges.push({
            text: `${item.suffix} - Cost:`,
            value: '$' + formatNumber(item.locationPrice + item.additionalItemsPrice),
            style: null,
            additionalItems: item.additionalItemsName,
            costDescription: `print cost $${formatNumber(item.locationPrice)}, additional items cost $${formatNumber(item.additionalItemsPrice)}`
          });
        }
      });

      if (jerseyNumberSides && jerseyNumberSides > 0) {
        resultWithOutScreenCharges.push(
          { text: "Jersey Number Sides:", value: jerseyNumberSides, style: null },
          { text: "Jersey Number Cost:", value: '$' + formatNumber(jerseyNumberCost), style: null }
        );
      }

      resultWithOutScreenCharges.push(
        { text: "Shirt Cost:", value: '$' + formatNumber(shirtCost), style: { borderBottom: '1px dotted' } },
        { text: "Net Cost:", value: '$' + formatNumber(netCostPerShirt), style: null },
        { text: "Mark Up:", value: formatNumber(markUp) + "%", style: { borderBottom: '1px dotted' } },
        { text: "Profit Per Shirt:", value: '$' + formatNumber(profitLoss.profit) },
        { text: "Retail Price Per Shirt:", value: '$' + formatNumber(profitLoss.retailPrice), style: { borderBottom: '1px dotted' } },
        { text: "Net Total Cost:", value: '$' + formatNumber(profitLoss.totalCost), style: null },
        { text: "Retail Total Cost:", value: '$' + formatNumber(profitLoss.retailPrice * qty), style: { borderBottom: '1px dotted' } },
        { text: "Total Profit:", value: '$' + formatNumber(profitLoss.profit * qty), style: null }
      );

      // Now build the WITH screen charges version: start with a copy of without-screen and then add screen lines
      const resultWithScreenCharges = JSON.parse(JSON.stringify(resultWithOutScreenCharges));

      if (displayScreenCharge) {
        resultWithScreenCharges.push(
          { text: `Screen Charges: Total Cost (${totalPrintColors} colors x $${formatNumber(costPerScreen)})`, value: '$' + formatNumber(screenChargeTotal), style: { borderBottom: '1px dotted' } },
          { text: "Screen Charge Mark Up:", value: formatNumber(markUp) + "%", style: { borderBottom: '1px dotted' } },
          { text: "Profit Per Screen Charge:", value: '$' + formatNumber(screenChargeTotal * markUp / 100), style: { borderBottom: '1px dotted' } },
          { text: "Retail Per Screen Charge:", value: '$' + formatNumber(retailPerScreencharge), style: null },
          { text: "Net Total Cost With Screen Charges:", value: '$' + formatNumber(profitLoss.totalCost + screenChargeTotal), style: null },
          { text: "Retail Price Per Shirt With Screen Charges:", value: '$' + formatNumber(retailPricePerShirtWithScreen), style: { borderBottom: '1px dotted' } },
          { text: "Retail Total Cost With Screen Charges:", value: '$' + formatNumber(retailTotalWithScreen), style: null },
          { text: "Total Profit With Screen Charges:", value: '$' + formatNumber((profitLoss.profit * qty) + (screenChargeTotal * markUp / 100)), style: null }
        );
      }

      // return all useful numbers + details (retail totals used for comparisons)
      return {
        quantity: qty,
        resultWithScreenCharges,
        resultWithOutScreenCharges,
        // numeric values (not strings) for easy comparison / math later:
        retailTotalWithoutScreen: retailTotalWithoutScreen,
        retailTotalWithScreen: parseFloat(retailTotalWithScreen.toFixed(2)),
        retailPricePerShirtWithoutScreen: parseFloat(profitLoss.retailPrice.toFixed(2)), // ✅ added 
        retailPricePerShirtWithScreen: parseFloat(retailPricePerShirtWithScreen.toFixed(2))
      };
    }; // end buildQuoteForQty

    // Build both quotes
    const qty1 = parseInt(data.quantity1, 10);
    const qty2 = parseInt(data.quantity2, 10);
    const qty1Result = buildQuoteForQty(qty1);
    const qty2Result = buildQuoteForQty(qty2);
console.log(qty2Result);
    // Comparison / Next Tier (USE retailTotalWithScreen for correct numbers)
    const extraShirts = qty2 - qty1;
    const extraShirtsvalue = qty2 - qty1;
    // Without screens charges
    const nextTierCostWithoutScreen = qty2Result.retailTotalWithoutScreen - qty1Result.retailTotalWithoutScreen;
const additionalPerShirtCostWithoutScreen = extraShirts > 0 ? nextTierCostWithoutScreen / extraShirts : 0;

// With screen charges
const nextTierCostWithScreen = qty2Result.retailTotalWithScreen - qty1Result.retailTotalWithScreen;
const additionalPerShirtCostWithScreen = extraShirts > 0 ? nextTierCostWithScreen / extraShirts : 0;
const add =parseFloat((qty2Result.retailTotalWithoutScreen-qty1Result.retailTotalWithoutScreen).toFixed(2));
const addin =add/extraShirtsvalue;

const add1 =parseFloat((qty2Result.retailTotalWithScreen-qty1Result.retailTotalWithScreen).toFixed(2));
const addin1 =add1/extraShirtsvalue;

let responsePayload = {};
if(data.screenCharge==true){
   responsePayload.nextTierData = {
    nextTierCost: add1,
    quantity1: qty1,
    quantity2: qty2,
    quantity1TotalCost: formatNumber(qty1Result.retailTotalWithScreen),
    quantity2TotalCost: formatNumber(qty2Result.retailTotalWithScreen),
    extraShirts,
    additionalPerShirtCost: Math.floor(addin1* 100) / 100
  };
}else{
   responsePayload.nextTierData = {
    nextTierCost: parseFloat((qty2Result.retailTotalWithoutScreen-qty1Result.retailTotalWithoutScreen).toFixed(2)),
    quantity1: qty1,
    quantity2: qty2,
    quantity1TotalCost: formatNumber(qty1Result.retailTotalWithoutScreen),
    quantity2TotalCost:  formatNumber(qty2Result.retailTotalWithoutScreen),
    extraShirts,
    additionalPerShirtCost: Math.floor(addin* 100) / 100
  };
}
return res.status(200).json({ 

  quantity1Result: { resultWithScreenCharges: qty1Result.resultWithScreenCharges, resultWithOutScreenCharges: qty1Result.resultWithOutScreenCharges }, quantity2Result: { resultWithScreenCharges: qty2Result.resultWithScreenCharges, resultWithOutScreenCharges: qty2Result.resultWithOutScreenCharges },
  responsePayload
    });
  } catch (error) {
    console.error("Error calculating shirt price comparison:", error);
    return res.status(500).json({ error: "Internal Server Error" });
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
  // Disable caching
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  try {
    const result = await dbService.getScreenCharge();

    if (result && result.value !== undefined) {
      res.status(200).json({ screenCharge: result.value });
    } else {
      res.status(404).json({ screenCharge: null, message: "Key not found" });
    }
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: 'Database error', detail: err.message });
  }
};
exports.saveMaterialData = async (req, res) => {
  const { materials } = req.body;
  console.log(materials);
  if (!materials || !Array.isArray(materials) || materials.length === 0) {
    return res.status(400).json({ success: false, error: "No materials provided" });
  }

  try {
    const result = await dbService.saveMaterialData(materials);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Database error" });
  }
};
exports.getMaterialData = async (req, res) => {
   // Disable caching
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

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