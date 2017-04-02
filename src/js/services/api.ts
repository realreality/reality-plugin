import { GMAPS_API_KEY, IPR_REST_API, MAPS_URL } from '../rr'

type LatLng = { lat: number, lng: number }

export const loadParkingZones = ({ lat, lng }: LatLng, dist = 500) =>
  fetch(`${IPR_REST_API}/zones-count?lat=${lat}&lon=${lng}&dist=${dist}`)
    .then(response => response.json())

export const loadNoise = ({ lat, lng }: LatLng, partOfDay: string) =>
  fetch(`${IPR_REST_API}/noise?lat=${lat}&lon=${lng}&dist=500&at-night=${partOfDay === 'night'}`)
    .then(response => response.json())

export const loadAirPollution = ({ lat, lng }: LatLng) =>
  fetch(`${IPR_REST_API}/atmosphere?lat=${lat}&lon=${lng}`)
    .then(response => response.json())

type LoadTagsParams = {
  type: string,
  location: LatLng,
  radius: number,
  minCount: number,
}

export const loadTags = ({ type, location, radius, minCount }: LoadTagsParams) => {
  const params = {
    location: encodeURI(`${location.lat},${location.lng}`),
    radius,
    type,
    key: GMAPS_API_KEY,
  }

  const query = Object.keys(params)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&')

  return fetch(`${MAPS_URL}/place/nearbysearch/json?${query}`)
    .then(response => response.json())
    .then(response => ({
      minCount,
      response,
      type,
    }))
}

export const loadLocation = (address: string) => {
  return fetch(`${MAPS_URL}/geocode/json?address=${encodeURI(address)}&key=${GMAPS_API_KEY}`)
    .then(response => response.json())
}
