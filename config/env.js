// tiny wrapper with default env vars
const dotenv = require('dotenv')

dotenv.load()

const env = process.env

module.exports = {
  GA_TRACKER_DEV: env.GA_TRACKER_DEV,
  GA_TRACKER_PROD: env.GA_TRACKER_PROD,
  PORT: (env.PORT || 3000),
  GMAPS_API_KEY: env.GMAPS_API_KEY,
  IPR_REST_API: (env.IPR_REST_API || 'https://realreality.publicstaticvoidmain.cz/rest'),
}
