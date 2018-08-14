module.exports = {


  friendlyName: 'Get client',


  description: '',


  inputs: {

  },


  exits: {

    success: {
      outputFriendlyName: 'Client',
      outputType: 'ref'
    },

  },


  fn: async function (inputs, exits) {

    const ZCRMRestClient = require('zcrmsdk');
    await ZCRMRestClient.initialize();

    // Send back the result through the success exit.
    return exits.success(ZCRMRestClient);

  }


};

