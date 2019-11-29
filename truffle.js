// Allows us to use ES6 in our migrations and tests.
require('babel-register');

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 7545,
      network_id: '*' // Match any network id
    },
    kovan: {
      // protocol: 'https',
    	// host: 'kovan.infura.io/5UyreKP8Xw5prCRt5yGr',
      //  port: 443,
      host: 'localhost',
      port: 8545,
    	network_id: 42,
      gas: 4000000
    }
  },
  build: "webpack"
}