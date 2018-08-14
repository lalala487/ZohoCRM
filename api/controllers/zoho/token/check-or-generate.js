module.exports = {


  friendlyName: 'Check or generate',


  description: '',


  inputs: {
    grantToken: {
      example: 'I am token',
      type: 'string',
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {

    await sails.helpers.zoho.token.checkOrGenerate(inputs.grantToken);
    return exits.success();

  }


};
