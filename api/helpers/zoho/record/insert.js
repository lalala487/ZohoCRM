module.exports = {


  friendlyName: 'Insert',


  description: 'Insert records to Zoho.',


  inputs: {
    records: {
      // eslint-disable-next-line camelcase
      example: [{First_Name: 'Foo'}, {First_Name: 'Bar'}],
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
    const response = await ZCRMRestClient.API.MODULES.post(input);

    // All done.
    return exits.success(JSON.parse(response.body));

  }


};

