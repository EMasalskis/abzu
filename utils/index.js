export const setDecimalPrecision = (number, n) => {
  if (isNaN(number) || isNaN(n)) {
    return number;
    //throw new Error('setDecimalPrecision, one of the arguments is not a number', number, n)
  }

  let splittedNumbers = String(number).split('.');
  let paddedLength = splittedNumbers[0].length;

  return Number(Number(number).toPrecision(paddedLength + n));
};

export const getIn = (object, keys, defaultValue) => {
  return keys.reduce(function(o, k) {
    return o && typeof o === 'object' && k in o ? o[k] : defaultValue;
  }, object);
};

export const getInTransform = (object, keys, defaultValue, transformater) => {
  let value = getIn(object, keys, null);
  return value !== null ? transformater(value) : defaultValue;
};

export const extractCoordinates = latLngString => {
  if (!latLngString) return null;

  let coords = null;

  if (latLngString.indexOf(',') > 1) {
    coords = latLngString.split(',');
  } else {
    coords = latLngString.split(/\s*[\s,]\s*/);
  }

  if (
    coords &&
    coords.length === 2 &&
    !isNaN(coords[0]) &&
    !isNaN(coords[1])
  ) {
    const result = coords.map( c => setDecimalPrecision(c, 6));
    return result;
  }
  return null;
}
