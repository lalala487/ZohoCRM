module.exports = {


  friendlyName: 'Get',


  description: 'Get layer.',


  inputs: {
    name: {
      example: 'Contacts_mapping',
      required: true,
      type: 'string',
    }
  },


  exits: {
    layerNotFound: {
      description: `There is no WideStage layer for selected module. Please create it before fetch`
    },
  },


  fn: async function (inputs, exits) {
    const {name} = inputs;
    const layer = await Layer.findOne({name});

    if (layer) {
      return exits.success(layer);
    } else {
      return exits.layerNotFound(module);
    }

  }


};

