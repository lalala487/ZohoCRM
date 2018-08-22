module.exports = {


  friendlyName: 'Get connection by layer',


  description: '',


  inputs: {
    layer: {
      example: {},
      required: true,
      type: {},
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {
    const {layer} = inputs;

    const dataSource = await sails.helpers.widestage.datasource.get(layer);
    const connection = await sails.helpers.widestage.connection.get(dataSource);

    return exits.success(connection);

  }


};

