module.exports = {


  friendlyName: 'Get',


  description: 'Get connection.',


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
    const connectionParams = {};// TODO
    const connection = await sails.helpers.databaseJs.connection.get(connectionParams);
    // All done.
    return exits.success(connection);

  }


};

