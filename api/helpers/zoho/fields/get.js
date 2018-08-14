module.exports = {


  friendlyName: 'Get',


  description: 'Get fields.',


  inputs: {
    module: {
      example: 'Contacts',
      required: true,
      type: 'string',
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {

    const {module} = inputs;

    const ZCRMRestClient = await sails.helpers.zoho.client.get();
    const response = await ZCRMRestClient.API.SETTINGS.getFields({module});


    const {fields} = sails.helpers.zoho.response.process(response);

    // All done.
    return exits.success(fields);

  }


};

