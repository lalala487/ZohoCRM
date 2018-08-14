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

    return exits.success();

  }


};
