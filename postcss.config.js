// postcss.config.js
module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 12, // Base font size
      propList: ['*'], // Convert all properties
      selectorBlackList: ['html'], // Ignore specific selectors
      minPixelValue: 2, // Don't convert values below 2px
    }
  }
}