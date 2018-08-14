module.exports = {


  friendlyName: 'Prepare',


  description: 'Prepare database-js statement',


  inputs: {
    connection: {
      example: {},
      required: true,
      type: 'ref',
    },
    query: {
      example: 'SELECT * FROM information WHERE user_id = ?',
      required: true,
      type: 'string',
    },
  },


  exits: {

  },


  fn: async function (inputs, exits) {

    const {connection} = inputs;

    const statement = await connection.prepareStatement(inputs.query);

    return exits.success(statement);

  }


};

