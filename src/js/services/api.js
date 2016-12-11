import { IPR_REST_API, GMAPS_API_KEY, MAPS_URL } from '../rr';

export const loadParkingZones = ({ lat, lng}, dist = 500) =>
  fetch(`${IPR_REST_API}/zones-count?lat=${lat}&lon=${lng}&dist=${dist}`)
    .then(response => response.json());

/**
 * @param {{ lat: Number, lng: Number }} location
 * @param {String} partOfDay - can be either `day` or `night`
 */
export const loadNoise = ({ lat, lng}, partOfDay) =>
  fetch(`${IPR_REST_API}/noise?lat=${lat}&lon=${lng}&dist=500&at-night=${partOfDay === 'night'}`)
    .then(response => response.json());

export const loadAirPollution = ({lat, lng}) =>
  fetch(`${IPR_REST_API}/atmosphere?lat=${lat}&lon=${lng}`)
    .then(response => response.json());

export const loadTags = (type, location, radius, minCount, vueApp) => {
  const params = {
    location: encodeURI(`${location.lat},${location.lng}`),
    radius,
    type,
    key: GMAPS_API_KEY
  };

  const query = Object.keys(params)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');

  fetch(`${MAPS_URL}/place/nearbysearch/json?${query}`)
    .then(response => response.json())
    .then(response => {
      if (response.results.length > minCount) {
        // TODO refactor side effect
        vueApp.tags +=
          `<span class="tag" title="${Vue.t('tags.' + type + '.desc')}">${Vue.t('tags.' + type + '.title')}</span>`;
      }
    });
};

export const loadLocation = address => {
  return fetch(`${MAPS_URL}/geocode/json?address=${encodeURI(address)}&key=${GMAPS_API_KEY}`)
    .then(response => response.json());
};
