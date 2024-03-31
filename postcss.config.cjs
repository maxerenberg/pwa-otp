const autoprefixer = require("autoprefixer");
const postcssNesting = require("postcss-nesting");

const config = {
  plugins: [postcssNesting(), autoprefixer],
};

module.exports = config;
