module.exports = {


  friendlyName: 'Import',


  description: 'Import tasks.',


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

    const mapping = await sails.helpers.module.mapping.get(module);

    const wideStageData = await sails.helpers.widestage.layer.explore(module);

    return exits.success(wideStageData);
  }


};

