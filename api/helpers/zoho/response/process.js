module.exports = {


  friendlyName: 'Process',


  description: 'Process response.',


  sync: true,


  inputs: {
    response: {
      description: 'Response from Zoho API v2',
      example: '{"someKey": "Some Val"}',
      required: true,
      type: 'ref',
    }
  },


  exits: {

  },


  fn: function (inputs, exits) {

    const {response} = inputs;

    let details;
    try {
      details = JSON.parse(response.body);
    } catch (e) {
      details = response.body;
    }

    if (response.statusCode === 200) {
      return exits.success(details);
    } else {
      return exits.error(details);
    }

  }


};

