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
            console.log(`Shirt Quantity Bucket Not Found`);
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
            console.log(`Additional Items Price Shirt Quantity Not Found`);
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

parseShirtPriceQuoteData = (data) => {
    const shirtCost = parseFloat(data.shirtCost);
    const shirtQuantity = parseInt(data.quantity);
    const markUp = parseFloat(data.markUp);
    const jerseyNumberSides = data.jerseyNumberSides ? parseInt(data.jerseyNumberSides) : null;
    const costPerScreen = data.screenCharge ? parseFloat(data.screenChargePrice) : null;

    return {
        shirtQuantity: shirtQuantity,
        jerseyNumberSides: jerseyNumberSides,
        shirtCost: shirtCost,
        markUp: markUp,
        screenCharge: data.screenCharge,
        costPerScreen: data.screenCharge ? costPerScreen : null
    }
}

parseEmbroideryPriceQuoteData = (data) => {
    const shirtCost = parseFloat(data.shirtCost);
    const shirtQuantity = parseInt(data.quantity);
    const markUp = parseFloat(data.markUp);
    const location1Stitches = data.location1Stitches;
    const location2Stitches = data.location2Stitches;
    const location3Stitches = data.location3Stitches;
    const location4Stitches = data.location4Stitches;

    return {
        shirtCost: shirtCost,
        shirtQuantity: shirtQuantity,
        markUp: markUp,
        location1Stitches: location1Stitches,
        location2Stitches: location2Stitches,
        location3Stitches: location3Stitches,
        location4Stitches: location4Stitches,
    }
}

// getAdditionalItemsInfo = (additionalItems, shirtQuantity,materialData) => {
//    // const additionalItemsPricePer = getAdditionalItemsPrice(shirtQuantity);
//     const additionalInfoString = additionalItems.map(item => {
//         return item.item
//     });
//     console.log(additionalInfoString);
//     const match = materialData.find(item => item.key === additionalInfoString);
//     const result = additionalInfoString.map(key =>
//         materialData.find(item => item.key === key)?.value || null
//         );
//     const additionalItemsPricePer =result;
//    console.log(additionalItemsPricePer);
//     return {
//         price: additionalItemsPricePer * additionalItems.length,
//         additionalItems: additionalInfoString
//     }
// }
getAdditionalItemsInfo = (additionalItems, shirtQuantity, materialData) => {
    const additionalInfoString = additionalItems.map(item => item.item);

    const result = additionalInfoString.map(key =>
        parseFloat(materialData.find(item => item.key === key)?.value || 0)
    );

    const totalPrice = result.reduce((sum, price) => sum + price, 0);

    return {
        price: totalPrice,  // ✔️ 20 + 10 = 30
        additionalItems: additionalInfoString
    }
}
getLocationsResult = (locations, shirtQuantity, shirtPrices, additionalItems,materialData) => {
    const shirtQuantityBucket = getShirtQuantityBucket(shirtQuantity);

    let additionalItemsPrice = 0.00;
    let locationsItemsPrice = 0.00;
    let totalColors = 0;

    let allLocations = { items: [] }

    locations.map(location => {
        if(location.value=='')
            {
                location.value =1;
            }   
    let currentObj = {
            locationPrice: 0.00,
            additionalItemsPrice: 0.00,
            name: location.register,
            colors: location.value,
            suffix: `Print Location ${location.sortValue}`
        }

        if (location && location.value > 0) {
            const currentLocationItemPrice = getPrintCost(shirtQuantityBucket, location.value, shirtPrices)
            locationsItemsPrice += currentLocationItemPrice
            currentObj.locationPrice = currentLocationItemPrice;
            totalColors += parseFloat(location.value);
        }
        if (additionalItems && additionalItems.length > 0) {
            const newData = [...additionalItems];
            const currentLocationItems = newData.filter(item => item.register === location.register);

            const additionalItemInfo = getAdditionalItemsInfo(currentLocationItems, shirtQuantity,materialData);
            console.log(additionalItemInfo.price);
            additionalItemsPrice += additionalItemInfo.price;
            currentObj.additionalItemsPrice = additionalItemInfo.price;
            const currentString = currentLocationItems.map(additionalItem => {
                return additionalItem.item;
            })
            currentObj.additionalItemsName = currentString;
        }
        allLocations.items.push(currentObj);
    })

    allLocations.additionalItemsPrice = additionalItemsPrice;
    allLocations.locationsItemsPrice = locationsItemsPrice;
    allLocations.totalLocationsPrice = additionalItemsPrice + locationsItemsPrice;
    allLocations.totalColors = totalColors;

    return allLocations;
}

getLocationsResultForEmbroidery = (locations, shirtQuantityBucket, embroideryPrices) => {
    let locationsItemsPrice = 0.00;
    let allLocations = { items: [] }

    locations.map(location => {
        let currentObj = {
            locationPrice: 0.00,
            name: location.register,
            stitches: location.value,
            suffix: `Stitch Location ${location.sortValue}`
        }

        if (location && location.value > 0) {
            const stitchQuantityBucket = getStitchQuantityBucket(location.value);
            const currentLocationItemPrice = getEmbroideryPrintCost(shirtQuantityBucket, stitchQuantityBucket, embroideryPrices)
            locationsItemsPrice += currentLocationItemPrice
            currentObj.locationPrice = currentLocationItemPrice;
        }
        allLocations.items.push(currentObj);
    })

    allLocations.locationsItemsPrice = locationsItemsPrice;
    allLocations.totalLocationsPrice = locationsItemsPrice;
    return allLocations;
}


getEmbroideryShirtQuantityBucket = (shirtQuantity) => {
    switch (true) {
        case (shirtQuantity >= 1 && shirtQuantity <= 5):
            return '1-5';
        case (shirtQuantity >= 6 && shirtQuantity <= 11):
            return '6-11';
        case (shirtQuantity >= 12 && shirtQuantity <= 23):
            return '12-23';
        case (shirtQuantity >= 24 && shirtQuantity <= 47):
            return '24-47';
        case (shirtQuantity >= 48 && shirtQuantity <= 99):
            return '48-99';
        case (shirtQuantity >= 100 && shirtQuantity <= 248):
            return '100-248';
        case (shirtQuantity >= 249):
            return '249+';
        default:
            console.log(`Embroidery Shirt Quantity Bucket Not Found`);
    }
}

getStitchQuantityBucket = (stitchQuantity) => {
    switch (true) {
        case (stitchQuantity >= 1 && stitchQuantity <= 4999):
            return '1-4999';
        case (stitchQuantity >= 5000 && stitchQuantity <= 6999):
            return '5000-6999';
        case (stitchQuantity >= 7000 && stitchQuantity <= 8999):
            return '7000-8999';
        case (stitchQuantity >= 9000 && stitchQuantity <= 10999):
            return '9000-10999';
        case (stitchQuantity >= 11000 && stitchQuantity <= 12999):
            return '11000-12999';
        case (stitchQuantity >= 13000 && stitchQuantity <= 14999):
            return '13000-14999';
        case (stitchQuantity >= 15000 && stitchQuantity <= 16999):
            return '15000-16999';
        case (stitchQuantity >= 17000 && stitchQuantity <= 18999):
            return '17000-18999';
        case (stitchQuantity >= 19000 && stitchQuantity <= 20999):
            return '19000-20999';
        case (stitchQuantity >= 21000):
            return '21000+';
        default:
            console.log(`Stitch Quantity Bucket Not Found`);
    }
}

getEmbroideryPrintCost = (embroideryShirtQuantityBucket, stitchQuantityBucket, embroideryDbPrices) => {
    return parseFloat(embroideryDbPrices.find(obj =>
        obj.quantity == embroideryShirtQuantityBucket && obj.stitches === stitchQuantityBucket
    ).price)
}

formatNumber = (number) => {
    const newNumber = number ? number : 0;
    return (Math.round(newNumber * 100) / 100).toFixed(2)
}

const utilities = {
    getShirtQuantityBucket: getShirtQuantityBucket,
    getPrintCost: getPrintCost,
    getAdditionalItemsPrice: getAdditionalItemsPrice,
    getProfitLoss: getProfitLoss,
    parseShirtPriceQuoteData: parseShirtPriceQuoteData,
    parseEmbroideryPriceQuoteData: parseEmbroideryPriceQuoteData,
    getEmbroideryShirtQuantityBucket: getEmbroideryShirtQuantityBucket,
    formatNumber: formatNumber,
    getLocationsResult: getLocationsResult,
    getLocationsResultForEmbroidery: getLocationsResultForEmbroidery
};
module.exports = utilities;