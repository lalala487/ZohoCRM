module.exports = {


  friendlyName: 'Import',


  description: 'Import dev.',


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

    await sails.helpers.tasks.module.process.with(inputs);

    return exits.success();

  }


};
