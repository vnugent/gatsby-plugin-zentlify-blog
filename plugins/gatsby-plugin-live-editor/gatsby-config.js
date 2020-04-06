module.exports = {
  plugins: [
    // {
    //   resolve: `gatsby-plugin-mdx`,
    //   options: {
    //     defaultLayouts: {
    //       default: require.resolve("./src/components/layout.js")
    //     }
    //   }
    // }
    {
      resolve: `gatsby-plugin-create-client-paths`,
      options: { prefixes: [`/foo/*`] },
    },
    {
      resolve: 'gatsby-plugin-exclude',
      options: { paths: ['/___tina /**', ] },
    },
    {
      resolve: 'gatsby-plugin-web-font-loader',
      options: {
        google: {
          families: ['Material+Icons']
        }
      }
    }
  ]
};
