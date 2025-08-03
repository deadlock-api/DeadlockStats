export const scaleColor = (value: number, min: number, max: number) => {
  const inBoundsValue = Math.min(Math.max(value, min), max);
  const normalizedValue = (inBoundsValue - min) / (max - min);
  const red = Math.round(255 * (1 - normalizedValue));
  const green = Math.round(255 * normalizedValue);
  return `rgb(${red}, ${green}, 0)`;
};
