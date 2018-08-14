module.exports = {


  friendlyName: 'Get record',


  description: '',


  inputs: {
    id: {
      example: '2739639000014033035',
      required: true,
      type: 'string',
    },
    module: {
      example: 'Leads',
      required: true,
      type: 'string',
    },
  },


  exits: {

    success: {
      outputFriendlyName: 'Record',
      outputType: 'ref'
    },

  },


  fn: async function (inputs, exits) {
    const {id, module} = inputs;

    const ZCRMRestClient = await sails.helpers.zoho.client.get();

    const input = {};
    input.id = id;
    input.module = module;
    const response = await ZCRMRestClient.API.MODULES.get(input);

    let details;
    try {
      details = JSON.parse(response.body);
    } catch (e) {
      details = response.body;
    }


    if (response.statusCode === 200) {
      const record = details.data[0];
      return exits.success(record);
    } else {
      return exits.error(details);
    }

  }


};

