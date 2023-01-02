const { utilities } = require("../utilities");

const shirtQuantityBuckets = ['6-11', '12-36', '37-72', '73-144', '145-287', '288-499', '500-999', '1000-4999', '5000+']

const shirtColorQuantities = [1, 2, 3, 4, 5, 6];

const embroideryStitchBuckets = ['1-4999', '5000-6999', '7000-8999', '9000-10999', '11000-12999', '13000-14999', '15000-16999', '17000-18999', '19000-20999', '21000+']

const embroideryQuantityBuckets = [
    '1-5', '6-11', '12-23', '24-47', '48-99', '100-248', '249+']

const embroideryStitchBucketsForDisplay = ['1-5k', '5-7k', '7-9k', '9-11k', '11-13k', '13-15k', '15-17k', '17-19k', '19-21k', '21k+']

const additionalItems = {
    minShirtQuantity: 12,
    items: [
        { name: 'Nylon, Poly, Mesh, Jersey', checked: false },
        { name: 'Legs, Sweats, Sleeves', checked: false }
    ],
    displayText: 'Additional Information: Mark if any of the following:'
};

const shirtPricingDisplay = {
    form:
        [
            {
                text: "Quantity",
                resultsText: "Quantity",
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
                register: 'printSideOneColors',
                required: false,
                errorDisplayMessage: 'Print location 1: Amt of colors ',
                inputValueType: 'integer',
                maxValue: 6
            },
            {
                text: "Print Location 2: Amt of colors",
                value: null,
                style: null,
                register: 'printSideTwoColors',
                required: false,
                errorDisplayMessage: 'Print location 2: Amt of colors ',
                inputValueType: 'integer',
                maxValue: 6
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
                text: null,
                value: null,
                style: null,
                register: 'additionalInformation',
                required: false,
                errorDisplayMessage: 'Additional Information ',
                inputValueType: null,
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
            }
        ],
    results: [
        {
            text: "Quantity",
            value: null,
            style: null
        },
        {
            text: "Print Location 1: Amt of colors",
            value: null,
            style: null
        },
        {
            text: "Print Location 2: Amt of colors",
            value: null,
            style: null
        },
        {
            text: "Optional: Jersey Number Sides:",
            value: null,
            style: { borderBottom: '1px dotted' }
        },
        {
            text: "Print Location 1 Cost",
            value: '$' + utilities.formatNumber(0),
            style: null
        },
        {
            text: "Print Location 2 Cost",
            value: '$' + utilities.formatNumber(0),
            style: null
        },
        {
            text: "Optional: Jersey Number Cost",
            value: '$' + utilities.formatNumber(0),
            style: null
        },
        {
            text: "Shirt Cost",
            value: '$' + utilities.formatNumber(0),
            style: null
        },
        {
            text: "Additional Information Cost",
            value: '$' + utilities.formatNumber(0),
            style: { borderBottom: '1px dotted' }
        },
        {
            text: "Net Cost",
            value: '$' + utilities.formatNumber(0),
            style: null
        },
        {
            text: "Mark Up",
            value: utilities.formatNumber(0) + '%',
            style: null
        },
        {
            text: "Profit Per Shirt",
            value: '$' + utilities.formatNumber(0),
            style: { borderBottom: '1px dotted' }
        },
        {
            text: "Retail Price Per Shirt",
            value: '$' + utilities.formatNumber(0),
            style: { borderBottom: '1px dotted' }
        },
        {
            text: "Retail Total Cost Without Screen Charges",
            value: '$' + utilities.formatNumber(0),
            style: null
        },
        {
            text: "Screen Charges: Total cost (print colors x screen charge)  ",
            value: '$' + utilities.formatNumber(0),
            style: null
        },
        {
            text: "Retail Cost With Screen Charges",
            value: '$' + utilities.formatNumber(0),
            style: null
        },
        {
            text: "Retail Price Per shirt with Screen Charges",
            value: '$' + utilities.formatNumber(0),
            style: null
        },
        {
            text: "Retail Cost total with screen charges: $X.XX",
            value: '$' + utilities.formatNumber(0),
            style: null
        },
        {
            text: "Total Profit",
            value: '$' + utilities.formatNumber(0),
            style: null
        }
    ],
    additionalItems: additionalItems
}

const embroideryPricingDisplay = {
    form:
        [
            {
                text: "Quantity",
                resultsText: "Quantity",
                value: null,
                style: null,
                register: 'quantity',
                required: true,
                errorDisplayMessage: 'Quantity ',
                inputValueType: 'integer',
            },
            {
                text: "Location 1 Stitches",
                value: null,
                style: null,
                register: 'location1Stitches',
                required: false,
                errorDisplayMessage: 'Location 1 Stitches ',
                inputValueType: 'integer',
            },
            {
                text: "Location 2 Stitches",
                value: null,
                style: null,
                register: 'location2Stitches',
                required: false,
                errorDisplayMessage: 'Location 2 Stitches ',
                inputValueType: 'integer',
            },
            {
                text: "Location 3 Stitches",
                value: null,
                style: null,
                register: 'location3Stitches',
                required: false,
                errorDisplayMessage: 'Location 3 Stitches ',
                inputValueType: 'integer',
            },
            {
                text: "Location 4 Stitches",
                value: null,
                style: null,
                register: 'location4Stitches',
                required: false,
                errorDisplayMessage: 'Location 4 Stitches ',
                inputValueType: 'integer',
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
            }
        ],
    results: [
        {
            text: "Quantity",
            value: null,
            style: null
        },
        {
            text: "Location 1 Stitches",
            value: null,
            style: null
        },
        {
            text: "Location 2 Stitches",
            value: null,
            style: null
        },
        {
            text: "Location 3 Stitches",
            value: null,
            style: null
        },
        {
            text: "Location 4 Stitches",
            value: null,
            style: null
        },
        {
            text: "Location 1 Cost",
            value: '$' + utilities.formatNumber(0),
            style: null
        },
        {
            text: "Location 2 Cost",
            value: '$' + utilities.formatNumber(0),
            style: null
        },
        {
            text: "Location 3 Cost",
            value: '$' + utilities.formatNumber(0),
            style: null
        },
        {
            text: "Location 4 Cost",
            value: '$' + utilities.formatNumber(0),
            style: null
        },
        {
            text: "Shirt Cost",
            value: '$' + utilities.formatNumber(0),
            style: null
        },
        {
            text: "Net Cost",
            value: '$' + utilities.formatNumber(0),
            style: null
        },
        {
            text: "Mark Up",
            value: utilities.formatNumber(0) + '%',
            style: null
        },
        {
            text: "Profit",
            value: '$' + utilities.formatNumber(0),
            style: { borderBottom: '1px dotted' }
        },
        {
            text: "Retail Price",
            value: '$' + utilities.formatNumber(0),
            style: { borderBottom: '1px dotted' }
        },
        {
            text: "Total Cost",
            value: '$' + utilities.formatNumber(0),
            style: null
        },
        {
            text: "Total Profit",
            value: '$' + utilities.formatNumber(0),
            style: null
        }
    ]
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