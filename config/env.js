// tiny wrapper with default env vars
const env = require('dotenv');

env.load();

module.exports = {
  
  PORT: (process.env.PORT || 3000),
  GMAPS_API_KEY: process.env.GMAPS_API_KEY,
  IPR_REST_API: (process.env.IPR_REST_API || 'https://realreality.publicstaticvoidmain.cz/rest')
};
