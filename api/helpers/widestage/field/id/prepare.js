module.exports = {


  friendlyName: 'Prepare',


  description: 'Prepare id.',


  sync: true,


  inputs: {
    field: {
      example: {
        elementID: 'p35z'
      },
      required: true,
      type: {
        elementID: 'string'
      },
    }
  },


  exits: {

  },


  fn: function (inputs, exits) {

    const {field} = inputs;

    const elementID = 'wst' + field.elementID.toLowerCase();
    const prepared = elementID.replace(/[^a-zA-Z ]/g, '');

    // All done.
    return exits.success(prepared);

  }


};

