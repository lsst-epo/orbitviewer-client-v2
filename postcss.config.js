// postcss.config.js
module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 16, // Base font size
      propList: ['*'], // Convert all properties
      selectorBlackList: [], // Ignore specific selectors
      minPixelValue: 2, // Don't convert values below 2px
    }
  }
}