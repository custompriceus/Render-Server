getShirtQuantityBucket = (shirtQuantity) => {
    switch (true) {
        case (shirtQuantity >= 6 && shirtQuantity <= 11):
            return '6-11';
        case (shirtQuantity >= 12 && shirtQuantity <= 36):
            return '12-36';
        case (shirtQuantity >= 37 && shirtQuantity <= 72):
            return '37-72';
        case (shirtQuantity >= 73 && shirtQuantity <= 144):
            return '73-144';
        case (shirtQuantity >= 145 && shirtQuantity <= 287):
            return '145-287';
        case (shirtQuantity >= 288 && shirtQuantity <= 499):
            return '288-499';
        case (shirtQuantity >= 500 && shirtQuantity <= 999):
            return '500-999';
        case (shirtQuantity >= 1000 && shirtQuantity <= 4999):
            return '1000-4999';
        case (shirtQuantity >= 5000):
            return '5000+';
        default:
            console.log(`Quantity Not Found`);
    }
}

getPrintCost = (shirtQuantityBucket, numberOfColors, dbPrices) => {
    return parseFloat(dbPrices.find(obj =>
        obj.quantity == shirtQuantityBucket && obj.colors === parseInt(numberOfColors)
    ).price)
}

getAdditionalItemsPrice = (shirtQuantity) => {
    switch (true) {
        case (shirtQuantity >= 12 && shirtQuantity <= 36):
            return 0.50;
        case (shirtQuantity >= 37 && shirtQuantity <= 72):
            return 0.35;
        case (shirtQuantity > 72):
            return 0.25;
        default:
            console.log(`Quantity Not Found`);
    }
}

getProfitLoss = (netCost, markUp, quantity) => {
    const profit = (netCost * (markUp / 100));
    const retailPrice = netCost + profit;
    const totalCost = netCost * quantity;
    const totalProfit = profit * quantity;

    return {
        profit: profit,
        retailPrice: retailPrice,
        totalCost: totalCost,
        totalProfit: totalProfit
    }
}

parseData = (data) => {
    const shirtCost = parseFloat(data.shirtCost);
    const shirtQuantity = parseInt(data.quantity);
    const markUp = parseFloat(data.markUp);
    const printSideOneColors = data.printSideOneColors;
    const printSideTwoColors = data.printSideTwoColors;
    const jerseyNumberSides = parseInt(data.jerseyNumberSides);

    return {
        shirtCost: shirtCost,
        shirtQuantity: shirtQuantity,
        markUp: markUp,
        printSideOneColors: printSideOneColors,
        printSideTwoColors: printSideTwoColors,
        jerseyNumberSides: jerseyNumberSides
    }
}

getAdditionalItemsInfo = (selectedAdditionalItems, shirtQuantity) => {
    let finalSelectedItems = [];
    let finalSelectedItemsString = ''
    if (selectedAdditionalItems && selectedAdditionalItems.map) {
        selectedAdditionalItems.map(additionalItem => {
            if (additionalItem.checked) {
                finalSelectedItems.push(additionalItem.name);
                if (finalSelectedItemsString === '') {
                    finalSelectedItemsString += additionalItem.name
                }
                else {
                    finalSelectedItemsString += ', ' + additionalItem.name
                }
            }
        })
    }

    let additionalItemsCost = 0.00;
    if (finalSelectedItems && finalSelectedItems.map) {
        const additionalItemsPricePer = getAdditionalItemsPrice(shirtQuantity);
        additionalItemsCost = finalSelectedItems.length * additionalItemsPricePer;
    }
    return {
        finalSelectedItems: finalSelectedItems,
        finalSelectedItemsString: finalSelectedItemsString,
        additionalItemsCost: additionalItemsCost
    }
}

const utilities = {
    getShirtQuantityBucket: getShirtQuantityBucket,
    getPrintCost: getPrintCost,
    getAdditionalItemsPrice: getAdditionalItemsPrice,
    getProfitLoss: getProfitLoss,
    getAdditionalItemsInfo: getAdditionalItemsInfo,
    parseData: parseData
};
module.exports = utilities;