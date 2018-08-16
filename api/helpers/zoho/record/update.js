module.exports = {


  friendlyName: 'Update',


  description: 'Update record.',


  inputs: {
    records: {
      // eslint-disable-next-line camelcase
      example: [{id: '123833', First_Name: 'Foo'}, {id: '123835', First_Name: 'Bar'}],
      required: true,
      type: ['ref'],
    },
    module: {
      example: 'Contacts',
      required: true,
      type: 'string',
    },
  },


  exits: {

  },


  fn: async function (inputs, exits) {

    const {records, module} = inputs;

    const ZCRMRestClient = await sails.helpers.zoho.client.get();

    const input = {};
    input.module = module;
    input.body = {data: records};
    const response = await ZCRMRestClient.API.MODULES.put(input);

    const processedResponse = await sails.helpers.zoho.response.process(response);

    // All done.
    return exits.success(processedResponse);

  }


};

