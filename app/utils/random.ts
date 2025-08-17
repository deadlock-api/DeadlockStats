export const sample = <T>(array: T[]): T => {
  if (array.length === 0) throw new Error("Cannot sample from an empty array");
  if (array.length === 1) return array[0];
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};
