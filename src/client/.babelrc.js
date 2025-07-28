module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        corejs: {
          version: 3.34,
          proposals: true,
        },
        shippedProposals: true,
      },
    ],
    '@babel/preset-react',
  ],
  plugins: [],
};
