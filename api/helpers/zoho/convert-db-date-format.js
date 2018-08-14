module.exports = {


  friendlyName: 'Convert db date format',


  description: '',


  sync: true,


  inputs: {
    dbString: {
      example: 'string',
      required: true,
      type: 'string',
    }
  },


  exits: {

  },


  fn: function (inputs, exits) {
    const moment = require('moment');

    const converted = moment(new Date(inputs.dbString)).format('YYYY-MM-DD HH:mm:ss');
    // All done.
    return exits.success(converted);

  }


};

