// Mock implementation of chalk for Jest tests
const chalk = {
  red: (text) => text,
  green: (text) => text,
  yellow: (text) => text,
  blue: (text) => text,
  magenta: (text) => text,
  cyan: (text) => text,
  white: (text) => text,
  gray: (text) => text,
  grey: (text) => text,
  black: (text) => text,
  bold: (text) => text,
  dim: (text) => text,
  italic: (text) => text,
  underline: (text) => text,
  strikethrough: (text) => text,
  inverse: (text) => text,
  hidden: (text) => text,
  visible: (text) => text,
  reset: (text) => text,
  bgRed: (text) => text,
  bgGreen: (text) => text,
  bgYellow: (text) => text,
  bgBlue: (text) => text,
  bgMagenta: (text) => text,
  bgCyan: (text) => text,
  bgWhite: (text) => text,
  bgBlack: (text) => text,
  bgGray: (text) => text,
  bgGrey: (text) => text
};

// Support chaining
Object.keys(chalk).forEach(key => {
  chalk[key] = Object.assign((text) => text, chalk);
});

module.exports = chalk;
