/** @type {import('@babel/core').TransformOptions} */
module.exports = (api) => {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
  };
};
