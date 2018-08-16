module.exports = {


  friendlyName: 'Get',


  description: 'Get connection to DB by Zoho module name.',


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
    const connection = await sails.helpers.widestage.connection.get(dataSource);
    // All done.
    return exits.success(connection);
  }
};

