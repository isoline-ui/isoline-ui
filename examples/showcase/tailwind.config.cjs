const path = require('node:path');
const ui = path.dirname(require.resolve('@isoline-ui/react-native/package.json'));
module.exports = {
  presets: [require('@isoline-ui/react-native/nativewind')],
  content: [path.join(__dirname, '*.{ts,tsx}'), path.join(ui, 'src/**/*.{ts,tsx}')],
};
