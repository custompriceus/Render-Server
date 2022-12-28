const shirtQuantityBuckets = ['6-11', '12-36', '37-72', '73-144', '145-287', '288-499', '500-999', '1000-4999', '5000+']

const shirtColorQuantities = [1, 2, 3, 4, 5, 6];

const embroideryStitchBuckets = ['1-4999', '5000-6999', '7000-8999', '9000-10999', '11000-12999', '13000-14999', '15000-16999', '17000-18999', '19000-20999', '21000+']

const embroideryQuantityBuckets = [
    '1-5', '6-11', '12-23', '24-47', '48-99', '100-248', '249+']

const embroideryStitchBucketsForDisplay = ['1-5k', '5-7k', '7-9k', '9-11k', '11-13k', '13-15k', '15-17k', '17-19k', '19-21k', '21k+']

const additionalItems = [
    { name: 'Nylon', checked: false },
    { name: 'Poly', checked: false },
    { name: 'Mesh', checked: false },
    { name: 'Jersey', checked: false },
    { name: 'Legs', checked: false },
    { name: 'Sweats', checked: false },
    { name: 'Sleeves', checked: false }
];

const constants = {
    shirtQuantityBuckets: shirtQuantityBuckets,
    shirtColorQuantities: shirtColorQuantities,
    embroideryStitchBuckets: embroideryStitchBuckets,
    embroideryQuantityBuckets: embroideryQuantityBuckets,
    embroideryStitchBucketsForDisplay: embroideryStitchBucketsForDisplay,
    additionalItems: additionalItems
};
module.exports = constants;