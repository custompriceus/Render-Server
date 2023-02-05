const { utilities } = require("../utilities");

const shirtQuantityBuckets = ['6-11', '12-36', '37-72', '73-144', '145-287', '288-499', '500-999', '1000-4999', '5000+']

const shirtColorQuantities = [1, 2, 3, 4, 5, 6];

const embroideryStitchBuckets = ['1-4999', '5000-6999', '7000-8999', '9000-10999', '11000-12999', '13000-14999', '15000-16999', '17000-18999', '19000-20999', '21000+']

const embroideryQuantityBuckets = [
    '1-5', '6-11', '12-23', '24-47', '48-99', '100-248', '249+']

const embroideryStitchBucketsForDisplay = ['1-5k', '5-7k', '7-9k', '9-11k', '11-13k', '13-15k', '15-17k', '17-19k', '19-21k', '21k+']

const shirtPricingForm = [
    {
        text: "Quantity",
        value: null,
        style: null,
        register: 'quantity',
        required: true,
        errorDisplayMessage: 'Quantity ',
        inputValueType: 'integer',
        minValue: 6
    },
    {
        text: "Print Location 1: Amt of colors",
        value: null,
        style: null,
        register: 'printSide1Colors',
        required: false,
        errorDisplayMessage: 'Print location 1: Amt of colors ',
        inputValueType: 'integer',
        maxValue: 6,
        additionalItems: true,
        sortValue: 1
    },
    {
        text: "Print Location 2: Amt of colors",
        value: null,
        style: null,
        register: 'printSide2Colors',
        required: false,
        errorDisplayMessage: 'Print location 2: Amt of colors ',
        inputValueType: 'integer',
        maxValue: 6,
        additionalItems: true,
        sortValue: 2,
        finalPrintLocation: true
    },
    {
        text: "Optional: If adding numbers, how many sides?",
        value: null,
        style: null,
        register: 'jerseyNumberSides',
        required: false,
        errorDisplayMessage: 'Number of Sides ',
        inputValueType: 'integer',
        maxValue: 2
    },
    {
        text: "Shirt Cost (1.50 for $1.50, 2.00 for $2.00, etc.)",
        value: null,
        style: null,
        register: 'shirtCost',
        required: true,
        errorDisplayMessage: 'Shirt Cost ',
        inputValueType: 'float'
    },
    {
        text: "Mark Up (50 for 50%, 100 for 100%, etc.)",
        value: null,
        style: null,
        register: 'markUp',
        required: true,
        errorDisplayMessage: 'Mark Up ',
        inputValueType: 'float'
    },
    {
        text: "Cost Per Screen (1.50 for $1.50, 2.00 for $2.00, etc.)",
        value: 16,
        style: null,
        register: 'costPerScreen',
        required: false,
        errorDisplayMessage: 'Cost Per Screen ',
        inputValueType: 'float',
        toggle: true,
        defaultToggle: false
    }
]

const embroideryPricingForm = [
    {
        text: "Quantity",
        value: null,
        style: null,
        register: 'quantity',
        required: true,
        errorDisplayMessage: 'Quantity ',
        inputValueType: 'integer',
        minValue: 6
    },
    {
        text: "Stitch Location 1: Amt of stitches",
        value: null,
        style: null,
        register: 'stitchLocation1Stitches',
        required: false,
        errorDisplayMessage: 'Stitch location 1: Amt of stitches ',
        inputValueType: 'integer',
        sortValue: 1
    },
    {
        text: "Shirt Cost (1.50 for $1.50, 2.00 for $2.00, etc.)",
        value: null,
        style: null,
        register: 'shirtCost',
        required: true,
        errorDisplayMessage: 'Shirt Cost ',
        inputValueType: 'float'
    },
    {
        text: "Mark Up (50 for 50%, 100 for 100%, etc.)",
        value: null,
        style: null,
        register: 'markUp',
        required: true,
        errorDisplayMessage: 'Mark Up ',
        inputValueType: 'float'
    },
]

const additionalItems = {
    minShirtQuantity: 12,
    additionalItems: [
        { name: 'Nylon, Poly, Mesh, Jersey', checked: false },
        { name: 'Legs, Sweats, Sleeves', checked: false }
    ],
    displayText: 'Additional Information: Mark if any of the following:',
    formItems: shirtPricingForm.filter(formItem => formItem.additionalItems)
};

const shirtPricingResults = [
    {
        text: "Quantity:",
        value: null,
        style: null
    },
    {
        text: "Print Location 1 - Amt of colors:",
        value: null,
        style: { borderTop: '1px dotted' }
    },
    {
        text: `Print Location 1 - Cost:`,
        value: '$' + formatNumber(0),
        style: null,
    },
    {
        text: "Optional - Jersey Number Sides:",
        value: null,
        // style: { borderBottom: '1px dotted' }
    },
    {
        text: "Optional - Jersey Number Cost:",
        value: '$' + utilities.formatNumber(0),
        style: null
    },
    {
        text: "Shirt Cost:",
        value: '$' + utilities.formatNumber(0),
        style: null
    },
    {
        text: "Net Cost:",
        value: '$' + formatNumber(0),
        style: null
    },
    {
        text: "Mark Up:",
        value: formatNumber(0) + "%",
        style: null
    },
    {
        text: "Profit Per Shirt:",
        value: '$' + formatNumber(0),
        style: { borderBottom: '1px dotted' }
    },
    {
        text: "Retail Price Per Shirt:",
        value: '$' + formatNumber(0),
        style: { borderBottom: '1px dotted' },
    },
    {
        text: "Net Total Cost:",
        value: '$' + formatNumber(0),
        style: null
    },
    {
        text: "Retail Total Cost:",
        value: '$' + formatNumber(0),
        style: { borderBottom: '1px dotted' },
    },
    {
        text: "Total Profit:",
        value: '$' + formatNumber(0),
        style: null
    },
]

const embroideryPricingResults = [
    {
        text: "Quantity:",
        value: null,
        style: null
    },
    {
        text: "Stitch Location 1 - Amt of stitches:",
        value: null,
        style: { borderTop: '1px dotted' }
    },
    {
        text: `Stitch Location 1 - Cost:`,
        value: '$' + formatNumber(0),
        style: null,
    },
    {
        text: "Shirt Cost:",
        value: '$' + utilities.formatNumber(0),
        style: null
    },
    {
        text: "Net Cost:",
        value: '$' + formatNumber(0),
        style: null
    },
    {
        text: "Mark Up:",
        value: formatNumber(0) + "%",
        style: null
    },
    {
        text: "Profit Per Shirt:",
        value: '$' + formatNumber(0),
        style: { borderBottom: '1px dotted' }
    },
    {
        text: "Retail Price Per Shirt:",
        value: '$' + formatNumber(0),
        style: { borderBottom: '1px dotted' },
    },
    {
        text: "Net Total Cost:",
        value: '$' + formatNumber(0),
        style: null
    },
    {
        text: "Retail Total Cost:",
        value: '$' + formatNumber(0),
        style: { borderBottom: '1px dotted' },
    },
    {
        text: "Total Profit:",
        value: '$' + formatNumber(0),
        style: null
    },
]

const shirtPricingDisplay = {
    form: shirtPricingForm,
    resultWithOutScreenCharges: shirtPricingResults,
    additionalItems: additionalItems,
    screenCharge: {
        defaultToggle: false
    }
}

const embroideryPricingDisplay = {
    form: embroideryPricingForm,
    resultWithOutScreenCharges: embroideryPricingResults,
    additionalItems: additionalItems,
    screenCharge: {
        defaultToggle: false
    }
}

const constants = {
    shirtQuantityBuckets: shirtQuantityBuckets,
    shirtColorQuantities: shirtColorQuantities,
    embroideryStitchBuckets: embroideryStitchBuckets,
    embroideryQuantityBuckets: embroideryQuantityBuckets,
    embroideryStitchBucketsForDisplay: embroideryStitchBucketsForDisplay,
    additionalItems: additionalItems,
    shirtPricingDisplay: shirtPricingDisplay,
    embroideryPricingDisplay: embroideryPricingDisplay
};
module.exports = constants;