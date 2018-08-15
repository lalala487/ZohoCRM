module.exports = {


  friendlyName: 'Get fields',


  description: '',


  inputs: {
    modules: {
      example: ['Contacts', 'Leads'],
      required: true,
      type: ['ref'],
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {

    const {modules} = inputs;

    await sails.helpers.util.asyncForEach(modules, async module => {
      try {
        await sails.helpers.module.fields.fetch(module);
      } catch (e) {
        sails.log.error(e);
      }
    });

    return exits.success();

  }


};
