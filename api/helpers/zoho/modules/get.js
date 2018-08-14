module.exports = {


  friendlyName: 'Get',


  description: 'Get modules.',


  inputs: {

  },


  exits: {

  },


  fn: async function (inputs, exits) {

    const ZCRMRestClient = await sails.helpers.zoho.client.get();
    const response = await ZCRMRestClient.API.SETTINGS.getModules();

    const {modules} = sails.helpers.zoho.response.process(response);
    return exits.success(modules);

  }


};

