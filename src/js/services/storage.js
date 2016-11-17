import RR from '../rr';

export const getFallbackPOIs = () => {
  const defaultPOIs = ['Muzeum, Praha', 'Radlická 180/50, Praha']; // Node5 = Radlická 180/50, Praha

  const pois = defaultPOIs
    .map(poi => ({
      address: {
        input: poi,
        interpreted: ''
      },
      duration: ''
    }));

  RR.logInfo('No data found in Chrome Local Storage. Using default data: ', pois);
  return pois;
};

export const getPOIs = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('pois', ({ pois }) => {
      if (chrome.runtime.lastError) {
        RR.logError('Error during obtaining POIs from local storage. Error:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
        return;
      }

      if (typeof(pois) !== 'undefined' && pois !== null) {
        RR.logInfo('POIs loaded from Chrome Local Storage: ', pois);
        resolve(pois);
      } else {
        resolve(getFallbackPOIs());
      }
    });
  });
};

export const setPOIs = newPois => {
  chrome.storage.local.set({'pois': newPois}, () => {
    RR.logDebug('New pois saved to local storage.', newPois);
  });
};
