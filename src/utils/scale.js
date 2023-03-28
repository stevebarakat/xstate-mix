// convert a value from one scale to another
// e.g. App.util.scale(-96, -192, 0, 0, 100) to convert
// -96 from dB (-192 - 0) to percentage (0 - 100)

export const transpose = function (val, f0, f1, t0, t1) {
  return ((val - f0) * (t1 - t0)) / (f1 - f0) + t0;
};

export const scale = (value) => Math.log(value + 101) / Math.log(113);

// convert dBFS to a percentage
export const dBToPercent = function (dB) {
  return transpose(dB, 0, 1, -100, 12);
};
