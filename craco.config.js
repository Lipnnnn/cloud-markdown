module.exports = {
  webpack: {
    configure: {
      target: 'electron-renderer',
      resolve: {
        fallback: {
          path: require.resolve("path-browserify"),
          fs: false,
          crypto: false
        }
      }
    }
  }
};