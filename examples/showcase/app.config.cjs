const { expo } = require('./app.json');
module.exports = { ...expo, experiments: { baseUrl: process.env.EXPO_BASE_URL ?? '' } };
