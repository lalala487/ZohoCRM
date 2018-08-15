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

    const layer = await sails.helpers.widestage.layer.get(module);
    const dataSource = await sails.helpers.widestage.datasource.get(layer);

    const connection = await sails.helpers.databaseJs.connection.get(dataSource.params[0].connection);
    // All done.
    return exits.success(connection);
  }
};

