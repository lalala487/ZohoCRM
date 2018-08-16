module.exports = {


  friendlyName: 'Get',


  description: 'Get connection.',


  inputs: {
    dataSource: {
      example: {},
      required: true,
      type: {},
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {
    const {dataSource} = inputs;

    const connection = await sails.helpers.databaseJs.connection.get(dataSource.params[0].connection);
    // All done.
    return exits.success(connection);
  }
};

